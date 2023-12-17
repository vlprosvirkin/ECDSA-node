import { useState } from "react";
import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1';
import { keccak256 } from "ethereum-cryptography/keccak";
import {toHex} from 'ethereum-cryptography/utils';
import { utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [signature, setSignature] = useState("");
  const [recoveryBit, setRecoveryBit] = useState("");
  const [hexMessage, setHexMessage] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function signMessage() {

    const txMessage = {
      sender: address,
      amount: parseInt(amount),
      recipient: recipient
    }

    //hash TX;
    const msg = JSON.stringify(txMessage);
    console.log("Initial message", msg);
    const bytes = utf8ToBytes(msg);
    console.log("Bytes", bytes);
    const hashedMsg = keccak256.keccak256(bytes);
    console.log("Hashed Nsg", hashedMsg);
    //to Hex TX
    const hexedMsg = toHex(hashedMsg);
    console.log("hexedMsg", hexMessage);
    setHexMessage(hexMessage);
    //sign TX with PKey
    const signatureArray = secp.secp256k1.sign(hexMessage, PRIVATE_KEY, 
      {recovered: true});
    const signature = toHex(signatureArray[0]);
    setSignature(signature);
    const recoveryBit = signatureArray[1];
    setRecoveryBit(recoveryBit);
  }

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature,
        recoveryBit,
        hexMessage
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="button" className="button" value="Sign TX" onClick={signMessage}/>
      <div>
        Your TX Hash: {hexMessage}
      </div>
      <div>
        Your signature: {signature}
      </div>
      <div>
        Your recovery Bit: {recoveryBit}
      </div>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
