import { useContract } from './useContract';
import LandTitle from "../abis/LandTitle.json";
import useIsValidNetwork from './useIsValidNetwork';
import { useWeb3React } from '@web3-react/core';
import { useAppContext } from '../AppContext';
import { formatUnits, parseEther } from '@ethersproject/units';
import { useEffect } from 'react';
// import {Web3} from 'web3';
import { ethers } from 'ethers';
const Web3 = require('web3');
const EthCrypto = require("eth-crypto");
// const signerIdentity = EthCrypto.createIdentity();

const useTitle = () => {
  const {library, account } = useWeb3React();
  const { isValidNetwork } = useIsValidNetwork();
  const titleContractAddress = '0x3d4De0B61ABe191090e75CE377Ce5C6dC72c5EaE';
  const registryAddress = '0x4feB40203704600e036Ac27da7975c9c857f13Dc';
  const titleContract = useContract(titleContractAddress, LandTitle.abi);
  const { setSignature, setAddedTitle, setTxnStatus, setSignStatus, signature, addedTitle } = useAppContext();

  const submitCode = async (code) => {
    let overrides = {
      from: account,
      // The maximum units of gas for the transaction to use
      gasLimit: 6000000
  };
    const addedTitle = await titleContract.addTitle(code, 2000, "location", "image", overrides);
    // const fetchedTitle = await titleContract.fetchTitle(0);
    // console.log("****addedTitle", fetchedTitle);
    setAddedTitle(addedTitle);
  };

  const signTitle = async (code) => {
    if (account && isValidNetwork) {
      let overrides = {
        from: account,
        // The maximum units of gas for the transaction to use
        gasLimit: 6000000
    };
      // const signer = library.getSigner(account).connectUnchecked() ;
      try {
        const web3 = window.ethereum && typeof window.ethereum!=='undefined' ? new Web3(window.ethereum): undefined;
        setSignStatus('SIGNING');
        // The hash we wish to sign and verify
        let hash = ethers.utils.solidityKeccak256(
              ['bytes'],
              [
                  ethers.utils.solidityPack(
                      ['address', 'address', 'string'],
                      [account, registryAddress, code]
                  )
              ]
          )
        console.log("***hash", hash);
        const signature = await web3.eth.sign(hash,account);
        setSignature(signature);
        // console.log("****", sig);
        console.log("***sig", signature)
        console.log("****account", account);
        console.log("***REgistry", registryAddress);

        // await titleContract.setSig(sig, overrides);
        setSignStatus('SIGNED');
      } catch (error) {
        console.log(error);
        setSignStatus('ERROR');
      }
    }
  };

  const registerTitle = async (code ,signature) => {
    let overrides = {
      from: account,
      // The maximum units of gas for the transaction to use
      gasLimit: 6000000,  
      // The amount to send with the transaction (i.e. msg.value)
      value: ethers.utils.parseEther("1"),  
      // value: 1,
      // The chain ID (or network ID) to use
      // chainId: 1  
    };
  
    if (account && isValidNetwork && signature) {
      try {
        setTxnStatus('REGISTERING');
        const registeredTitle = await titleContract.registerTitle(0, signature, code, overrides);
        await registeredTitle.wait(1);
        setTxnStatus('REGISTERED');
      } catch (error) {
        setTxnStatus('ERROR');
      }
    }
  };

  return {
    signature,
    addedTitle,
    signTitle,
    submitCode,
    registerTitle,
  };
};

export default useTitle;