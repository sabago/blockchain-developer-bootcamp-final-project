// import './App.css';
import React from 'react';
import { Container } from 'react-bootstrap';
import InteractionCard from './components/InteractionCard';
import ConnectWalletModal from './components/ConnectWalletModal';
import useWalletConnectionModal from './hooks/useWalletConnectionModal';
import { AppContextProvider } from './AppContext';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import Header from './components/Header';

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

const App = () => {
  const { isWalletConnectModalOpen } = useWalletConnectionModal();
  return (
    <AppContextProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Container style={{paddingTop: 50}}>
          {isWalletConnectModalOpen && <ConnectWalletModal />}
          <Header />
          <InteractionCard />
        </Container>
      </Web3ReactProvider>
    </AppContextProvider>
  )
}

export default App;
