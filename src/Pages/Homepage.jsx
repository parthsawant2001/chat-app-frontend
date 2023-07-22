import React, { useEffect } from 'react';
import Login from './../components/Authentication/Login';
import Signup from './../components/Authentication/Signup';
import { useHistory } from 'react-router-dom';
import {
  Container,
  Box,
  Text,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Tab,
} from '@chakra-ui/react';

const Homepage = () => {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) history.push('/chats');
  }, [history]);

  return (
    <Container maxW='xl' centerContent>
      <Box
        d='flex'
        justifyContent='center'
        p={3}
        bg={'white'}
        w='100%'
        m='40px 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
      >
        <Text fontFamily='Work sans' fontSize='4xl'>
          Chat-app
        </Text>
      </Box>
      <Box bg='white' p={4} w='100%' borderRadius='lg' borderWidth='1px'>
        <Tabs isFitted variant='enclosed'>
          <TabList mb='1em'>
            <Tab>Login</Tab>
            <Tab>Signup</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Homepage;
