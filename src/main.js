const { Blockchain, Transaction } = require("./blockchain");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // Algorithm basis for bitcoin

const myKey = ec.keyFromPrivate(
  "217e27460b289e2c0e2928dcb26c4b93bb3d1c5ef70d776f58bb0a538647374a"
);

// Public key extracted from private key
const myWalletAddress = myKey.getPublic("hex");

let bibiCoin = new Blockchain();

// Mine first block
console.log("\n Starting the miner...");
bibiCoin.minePendingTransactions(myWalletAddress);

// Create a transaction & sign with my key
const tx1 = new Transaction(myWalletAddress, "address2", 100);
tx1.signTransaction(myKey);
bibiCoin.addTransaction(tx1);

// Mine block
bibiCoin.minePendingTransactions(myWalletAddress);

// Create a second transaction
const tx2 = new Transaction(myWalletAddress, "address1", 100);
tx2.signTransaction(myKey);
bibiCoin.addTransaction(tx2);

// Mine block
bibiCoin.minePendingTransactions(myWalletAddress);

// Get balance after transactions
console.log();
console.log(
  "\n Balance of bibi is",
  bibiCoin.getBalanceOfAddress(myWalletAddress)
);

// Test tampering
console.log("Is chain valid?", bibiCoin.isChainValid());
bibiCoin.chain[1].transactions[0].amount = 1; // if you try to tamper with it, it returns false for validity

console.log("Is chain valid?", bibiCoin.isChainValid());
