import logo from './avax-logo.png';
import React, { useState, useEffect } from "react";
import "./App.css";
import { useMoralis, useMoralisWeb3ApiCall, useMoralisWeb3Api, useMoralisQuery, useMoralisCloudFunction, useTokenPrice } from "react-moralis";
import { Button, ButtonGroup, Box, Wrap, Text, Heading, Divider, Stack, Alert, AlertIcon } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, Container, Center } from "@chakra-ui/react";

const AVAXTokenAddress = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const AvalancheChain = "avalanche";

const LogoutButton = () => {
  const { logout, isAuthenticating } = useMoralis();

  return (
    <Button display={"block"} colorScheme="red" variant="solid" isLoading={isAuthenticating} onClick={() => logout()} disabled={isAuthenticating}>
      Logout
    </Button>
  );
};

const displayTokenBalancesTable = (tokenData) => {
  return (
    <div>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Token Name</Th>
            <Th>Balance</Th>
            <Th>Symbol</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tokenData.length !== 0 ? (
            tokenData.map((element, i) => {
              return (
                <React.Fragment key={i}>
                  <Tr>
                    <Td>{element.name}</Td>
                    <Td>{element.balance / ("1e" + element.decimals)}</Td>
                    <Td>{element.symbol}</Td>
                  </Tr>
                </React.Fragment>
              );
            })
          ) : (
            <Tr>
              <Td></Td>
              <Td>No Tokens</Td>
              <Td></Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
};

function App() {
  const { authenticate, isAuthenticated, user, Moralis } = useMoralis();

  const Web3Api = useMoralisWeb3Api();
  //------ Moralis Web3 API methods for Native, ERC20 & NFT  ---------
  const {
    fetch,
    data,
    error,
    isLoading
  } = useMoralisWeb3ApiCall(Web3Api.account.getNativeBalance, {
    chain: AvalancheChain,
  });

  // Token List

  const {
    fetch: tokenFetch,
    data: tokenData,
    error: tokenError,
    isLoading: tokenIsLoading,
  } = useMoralisWeb3ApiCall(Web3Api.account.getTokenBalances, {
    chain: AvalancheChain,
  });

  // Token Prices

  const {
    fetchTokenPrice,
    data: tokenPriceData,
    tokenPriceError,
    tokenPriceIsLoading,
    tokenPriceIsFetching
  } = useTokenPrice({
    address: AVAXTokenAddress,
    chain: AvalancheChain
  })

  // NFT

  const [userState, setUserState] = useState(null);
  const [openModel, setOpenModel] = useState(false);


  useEffect(() => {
    //call API every 5 seconds
    const interval = setInterval(() => {
      if (user) {
        setUserState(user);
        fetch();
        tokenFetch();
        // nft fetch
      }
      fetchTokenPrice()
    }, 5000);
    //clear the interval
    console.log(user, "USER");

    return () => clearInterval(interval);
  }, [user]);

  function avalanchePrice() {
    return (tokenPriceData ? tokenPriceData.usdPrice : 0)
  }

  Moralis.onChainChanged(async function (chain) {
    if (chain !== "0xa86a") {
      setOpenModel(true);
    } else {
      setOpenModel(false);
    }
  });

  if (!isAuthenticated) {
    return (
      <Container maxW="container.lg">
        {openModel && (
          <Alert status="error">
            <AlertIcon />
            Please switch to Avalanche Network
          </Alert>
        )}
        <Center>
          <img width={500} height={500} src={logo} alt="logo" />
        </Center>
        <Center>
          <Heading as="h2" size="3x1" p={10}>
            Avalanche Wallet Tracker
          </Heading>
        </Center>
        <Center>
          <Button colorScheme="green" size="lg" onClick={() => authenticate()}>
            Sign in using Metamask
          </Button>
        </Center>
      </Container>
    );
  }

  return (
    <Box display={"block"} p={35} className="App">
      {openModel && (
        <Alert status="error">
          <AlertIcon />
          Please switch to Avalanche Network
        </Alert>
      )}
      <LogoutButton />
      <Center>
        <img width={500} height={500} src={logo} alt="logo" />
      </Center>
      <Center>
        <Heading as="h2" size="3x1" p={10}>
          Avalanche Wallet Tracker
        </Heading>
      </Center>

      {!isLoading && data !== null ? (
        <Stack direction={["column", "row"]} spacing="24px">
          <Text fontSize="2xl" style={{ padding: "10px", textAlign: "initial", fontWeight: "bold" }}>
            AVAX Balance : {data.balance / ("1e" + 18)} ($ {(data.balance / ("1e" + 18) * avalanchePrice()).toFixed(2)})
          </Text>
        </Stack>
      ) : (
        <p>Loading</p>
      )}

      <Text fontSize="3xl" style={{ textAlign: "initial", fontWeight: "bold" }}>
        Wallet Tokens
      </Text>
      <Button colorScheme="green" variant="outline" onClick={() => tokenFetch()} disabled={tokenIsLoading}>
        Refetch Tokens
      </Button>
      {!tokenIsLoading && tokenData !== null ? displayTokenBalancesTable(tokenData) : <p>Loading</p>}
    </Box>
  );
}

export default App;
