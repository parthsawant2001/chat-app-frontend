import React, { useState } from 'react';
import { VStack } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { ChatState } from './../../Context/ChatProvider';

const Login = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [show, setShow] = useState(false);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const { setUser, user } = ChatState();

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: 'Please Fill all the Feilds',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      const data = await axios
        .post(
          'https://chat-app-backend-oj1m.onrender.com/api/user/login',
          { email, password },
          config
        )
        .then();

      if (data && data.d) {
        const { values } = data;
        // Do something with the 'data' here, e.g., store it in state or use it in your application
        console.log('Login successful:', values);
      } else {
        console.log('Invalid response format:', data);
      }

      setUser(data);
      // console.log(data);
      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      history.push('/chats');
      // document.window.location.reload();
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: error.response.data.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };
  return (
    <VStack spacing='5px'>
      <FormControl id='email' isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder='Enter your name'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id='password' isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? 'text' : 'password'}
            placeholder='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={handleClick}>
              {show ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        width='100%'
        style={{ marginTop: 15 }}
        isLoading={loading}
        onClick={submitHandler}
      >
        Login
      </Button>
      <Button
        colorScheme='red'
        onClick={() => {
          setEmail('guest@example.com');
          setPassword('12345678');
        }}
        width='100%'
        style={{ marginTop: 15 }}
      >
        Guest Login
      </Button>
    </VStack>
  );
};

export default Login;
