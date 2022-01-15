import React, { createContext, useReducer } from 'react';

const initialContext = {
  ethBalance: '--',
  setEthBalance: () => {},
  signature: '',
  setSignature: () => {},
  addedTitle: false,
  setAddedTitle: () => {},
  isWalletConnectionModalOpen: false,
  setWalletConnectModal: () => {},
  signStatus: 'NOT_SIGNED',
  setSignStatus: () => {},
  txnStatus: 'NOT_REGISTERED',
  setTxnStatus: () => {},
};

const appReducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_ETH_BALANCE':
      return {
        ...state,
        ethBalance: payload,
      };

    case 'SET_SIGNATURE':
      return {
        ...state,
        signature: payload,
      };

    case 'SET_ADDED_TITLE':
      return {
        ...state,
        addedTitle: payload,
      };

    case 'SET_WALLET_MODAL':
      return {
        ...state,
        isWalletConnectModalOpen: payload,
      };

    case 'SET_SIGN_STATUS':
      return {
        ...state,
        signStatus: payload,
    };

    case 'SET_TXN_STATUS':
      return {
        ...state,
        txnStatus: payload,
      };
    default:
      return state;
  }
};

const AppContext = createContext(initialContext);
export const useAppContext = () => React.useContext(AppContext);
export const AppContextProvider = ({ children }) => {
  const [store, dispatch] = useReducer(appReducer, initialContext);

  const contextValue = {
    ethBalance: store.ethBalance,
    setEthBalance: (balance) => {
      dispatch({ type: 'SET_ETH_BALANCE', payload: balance });
    },
    signature: store.signature,
    setSignature: (sig) => {
      dispatch({ type: 'SET_SIGNATURE', payload: sig });
    },
    addedTitle: store.addedTitle,
    setAddedTitle: (title) => {
      dispatch({ type: 'SET_ADDED_TITLE', payload: title });
    },
    isWalletConnectModalOpen: store.isWalletConnectModalOpen,
    setWalletConnectModal: (open) => {
      dispatch({ type: 'SET_WALLET_MODAL', payload: open });
    },
    signStatus: store.signStatus,
    setSignStatus: (status) => {
      dispatch({ type: 'SET_SIGN_STATUS', payload: status });
    },
    txnStatus: store.txnStatus,
    setTxnStatus: (status) => {
      dispatch({ type: 'SET_TXN_STATUS', payload: status });
    },
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
