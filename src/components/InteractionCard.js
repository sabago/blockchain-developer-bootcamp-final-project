import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Text from '../components/Text';
import Card from '../components/Card';
import Button from 'react-bootstrap/Button';
import { colors } from '../theme';
import { useAppContext } from '../AppContext';
import Spinner from 'react-bootstrap/Spinner';
import useEth from '../hooks/useEth';
import useTitle from '../hooks/useTitle';
import useTransaction from '../hooks/useTransaction';
import { Contract } from '@ethersproject/contracts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  -webkit-box-align: center;
  align-items: center;
  flex: 1 1 0%;
  overflow: hidden auto;
  z-index: 1;
`;

const InteractionCard = () => {
  const [code, setCode] = useState('');
  const {signature, addedTitle, signTitle, submitCode,registerTitle, } = useTitle();
  const { ethBalance } = useEth();
  const { txnStatus, setTxnStatus, setSignStatus, signStatus } = useTransaction();
  
  const handleCodeChange = (event) => {
    setCode(event.target.value);
  }

  const handleCodeSubmit = async (event) => {
    alert(`The title code submitted is: ${code}`);
    event.preventDefault();
    if (code !== '' &&code.length=== 12) {
       await submitCode(code);
    } else {
        alert('Invalid title code');
    }
  }

  const handleSignTitle = async () => {
      await signTitle(code);
  }

  const handleRegisterTitle = async () => {
      if (signature) {
        await registerTitle(code, signature);
    } else {
        alert('You must sign your land title!');
    }
  }


    if (signStatus === 'SIGNING') {
      return (
        <Container show>
          <Card style={{ maxWidth: 420, minHeight: 400 }}>
            <Spinner animation="border" role="status" className="m-auto" />
            <Text block center className="mb-5">
                ...signing...
          </Text>
          </Card>
        </Container>
      );
    }


  if (txnStatus === 'REGISTERED') {
    return (
      <Container show>
        <Card style={{ maxWidth: 420, minHeight: 400 }}>
          <Text block center className="mb-5">
            Success! You have registered your land title on the blockchain.
          </Text>
          <Button onClick={() => setTxnStatus('NOT_REGISTERED')}>Go Back</Button>
        </Card>
      </Container>
    );
  }

  if (txnStatus === 'ERROR') {
    return (
      <Container show>
        <Card style={{ maxWidth: 420, minHeight: 400 }}>
          <Text>Registration failed.</Text>
          <Button onClick={() => setTxnStatus('NOT_REGISTERED')}>Go Back</Button>
        </Card>
      </Container>
    );
  }
  return (
    <Container show>
      <Card style={{ maxWidth: 800, minHeight: 400 }}>
        <Text block t2 color={colors.black} className="mb-3">
          Register Your Land Title On The Blockchain!
        </Text>
        <h6> Note: You must connect to Metamask to register your land title. </h6>
        <label>
          Title Code:
          <input 
            type="text" 
            placeholder="a1b2c3d4e5f6" 
            value={code} 
            onChange={handleCodeChange} 
            style={{marginLeft: 10}}
          />
          <h6>For testing, use "a1b2c3d4e5f6" as the code</h6>
        </label>
        {txnStatus === 'NOT_REGISTERED' && <Button 
          // variant="outline-dark" 
          disabled={code === '' || code.length!==12} 
          style={{margin: '10px auto', backgroundColor: colors.black}}
          onClick={handleCodeSubmit}>
           SUBMIT CODE
        </Button>}
        {addedTitle && 
          <Card style={{display: 'flex', alignSelf: 'center', marginTop:'8px', maxWidth: 420, minHeight: 200, backgroundColor: 'white'}}>
            <h3> Your Land Title Details</h3>
            <p>Size: 2000sqft</p>
            <p>Location: 'location'</p>
            <p>Image: 'image'</p>
          </Card>
            }
        {addedTitle && <Button
                style={{margin:'10px auto', backgroundColor: colors.black}}
                onClick={handleSignTitle}>
          SIGN TITLE
        </Button>}    
        {signature && 
                <Button 
                // variant="outline-dark"  
                // className="mt-3" 
                style={{margin:'10px auto', backgroundColor: colors.black}}
                onClick={handleRegisterTitle}>
          REGISTER TITLE
        </Button>}
        {txnStatus === 'REGISTERED' && <Text block t2 color={colors.grey} className="mb-3">Success! You have registered your land title on the blockchain. </Text>}
      </Card>
    </Container>
  );
};

export default InteractionCard;
