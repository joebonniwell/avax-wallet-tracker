import logo from './avax-logo.png';
import './App.css';
import { Box, Center, Heading } from '@chakra-ui/react';

function App() {
  return (
    <Box display={"block"} p={35} className="App">
      <Center>
        <img width={500} height={500} src={logo} alt="logo" />
      </Center>

      <Center>
        <Heading as="h2" size="3x1" p={10}>
          Avalanche Wallet Tracker
        </Heading>
      </Center>
    </Box>
  );
}

export default App;
