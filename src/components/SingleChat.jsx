import React, { useState, useEffect } from 'react';
import { ChatState } from './../Context/ChatProvider';
import { Box, Text } from '@chakra-ui/layout';
import { IconButton } from '@chakra-ui/button';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from './../config/ChatLogics';
import ProfileModal from './Authentication/miscellaneous/ProfileModal';
import UpdateGroupChatModal from './Authentication/miscellaneous/UpdateGroupChatModal';
import { Spinner } from '@chakra-ui/spinner';
import { FormControl } from '@chakra-ui/form-control';

import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useToast, Button } from '@chakra-ui/react';
import './styles.css';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';

const ENDPOINT = 'https://chat-app-backend-oj1m.onrender.com';
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const {
    user,
    selectedChat,
    setSelectedChat,
    setNotifications,
    notifications,
  } = ChatState();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
  }, []);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `https://chat-app-backend-oj1m.onrender.com/api/message/${selectedChat._id}`,
        config
      );
      // console.log(messages);
      setMessages(data);
      setLoading(false);

      socket.emit('join chat', selectedChat._id);
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to Loaddd the Messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on('message received', (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notifications.includes(newMessageRecieved)) {
          setNotifications([newMessageRecieved, notifications]);
          setFetchAgain(!fetchAgain);
        }

        //notification
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const sendMessage = async (e) => {
    setButtonLoading(true);
    if (newMessage) {
      socket.emit('stop typing', selectedChat._id);
      try {
        const config = {
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          'https://chat-app-backend-oj1m.onrender.com/api/message',
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        setButtonLoading(false);
        setNewMessage('');
        // console.log(data);
        socket.emit('new message', data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: 'Error Occured.',
          description: 'Failed to send the message.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom',
        });
      }
    }
  };

  const typingHandler = (value) => {
    // console.log(newMessage);
    setNewMessage(value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);

    // const searchUsers = groupUsers.filter((user) => user.startsWith(value));
    // console.log(searchUsers);
    // const matches = selectedChat.users.filter((user) =>
    //   selectedChat.users.startsWith(value)
    // );
    // console.log('matches' + matches);
    // setDropDown(matches.map((match) => <li key={match}>{match}</li>));
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w='100%'
            fontFamily='Work sans'
            display='flex'
            justifyContent={{ base: 'space-between' }}
            alignItems='center'
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display='flex'
            flexDir='column'
            justifyContent='flex-end'
            p={3}
            bg='#E8E8E8'
            w='100%'
            h='100%'
            borderRadius='lg'
            overflowY='hidden'
          >
            {loading ? (
              <Spinner
                size='xl'
                w={20}
                h={20}
                alignSelf='center'
                margin='auto'
              />
            ) : (
              <div className='messages'>
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl mt={3} isRequired>
              {isTyping ? (
                <div
                  style={{
                    backgroundColor: '#B9F5D0',
                    borderRadius: '20px',
                    padding: '5px 15px',
                    maxWidth: '10%',
                  }}
                >
                  Typing...
                </div>
              ) : (
                <></>
              )}
              {/* <MentionsInput> */}
              <Button
                isLoading={buttonLoading}
                colorScheme='messenger'
                onClick={sendMessage}
                w='full'
                mb={3}
              >
                Send
              </Button>
              <MDEditor
                data-color-mode='dark'
                value={newMessage}
                onChange={typingHandler}
              />
              {/* </MentionsInput> */}
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          h='100%'
        >
          <Text fontSize='3xl' pb={3} fontFamily='Work sans'>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
