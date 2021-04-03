const { Blockchain, Transaction } = require("./blockchain");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // Algorithm basis for bitcoin

require("dotenv").config({
  path: `${__dirname}/.env`,
});

const privateKey = process.env.PRIVATE_KEY;

const myKey = ec.keyFromPrivate(
  "217e27460b289e2c0e2928dcb26c4b93bb3d1c5ef70d776f58bb0a538647374a"
);
const myWalletAddress = myKey.getPublic("hex");

let bibiCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, "public key goes here", 10);
tx1.signTransaction(myKey);
bibiCoin.addTransaction(tx1);

console.log("\n Starting the miner...");
bibiCoin.minePendingTransactions(myWalletAddress);

console.log(
  "\n Balance of bibi is",
  bibiCoin.getBalanceOfAddress(myWalletAddress)
);

console.log("Is chain valid?", bibiCoin.isChainValid());

bibiCoin.chain[1].transactions[0].amount = 1; // if you try to tamper with it, it returns false for validity

console.log("Is chain valid?", bibiCoin.isChainValid());
