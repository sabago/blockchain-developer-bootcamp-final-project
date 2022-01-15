import React, { useEffect } from 'react';
import Text from './Text';
import Card from './Card';
import { colors } from '../theme';
import { useWeb3React } from '@web3-react/core';
import useEth from '../hooks/useEth';

const BalanceCard = () => {
  const { account } = useWeb3React();
  const { fetchEthBalance, ethBalance } = useEth();

  useEffect(() => {
    if (account) {
      fetchEthBalance();
    }
  }, [account, fetchEthBalance]);

  return (
    <Card style={{ maxWidth: 300, backgroundColor: colors.lightBlue }}>
      <Text block color={colors.green}>
        ETH balance: {ethBalance}
      </Text>
    </Card>
  );
};

export default BalanceCard;
