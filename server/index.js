const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "027f8095ba5eb3d55ac47479f71e68259f318ebd8febc5b45d9a2179ab1ce96e41": 100,
  //Private Key: 96a53170c9c873337af19f9c1ea9c0d21efec4e78c6c60807d7167d7b64cf8b3
  "0285fa8ee833b9876502412d1a2206e3603d42bba244218f4ab3f97e7016f96236": 50,
  //Private Key: 1c5af8114ffa7017078d745886144edb9905a31f2bdec9de8bcab0b3212b447f
  "02b79884c03a5e508a208ceab314a4acfcd6378dc12cf5e302195b0fd1819a7d92": 75,
  //Private Key: 8356643a39ff2a9452e942267de89408c1357f09ef475451e9604c4c96e31b1d
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  //TODO: get a signature from the client

  //const { sender, recipient, amount } = req.body;

  //const sender = secp.secp256k1.recoverPublicKey(signature);
  
  const { sender, recipient, amount, signature, hexMessage, recoveryBit } = req.body;

  //recover the public address from the signature
  const sig = secp.secp256k1.Signature.fromCompact(signature);
  const recoveredSignature = sig.addRecoveryBit(recoveryBit);
  const publicKey = recoveredSignature.recoverPublicKey(hexMessage);


  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else if (sender != publicKey) {
    res.status(400).semd({ message: "Not your wallet"})
  }
  
  {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
