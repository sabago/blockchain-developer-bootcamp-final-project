import { useAppContext } from '../AppContext';

const useTransaction = () => {
  const { setTxnStatus, txnStatus, setSignStatus, signStatus } = useAppContext();
  return { setTxnStatus, txnStatus, setSignStatus, signStatus };
};

export default useTransaction;
