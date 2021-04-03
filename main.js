const SHA256 = require("crypto-js/sha256"); //Hash function

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash(); //Hash of block
    this.nonce = 0;
  }

  // Take the property of the block and run it through a hash function
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    // Keeps running as long as the first nth char is not equal to the difficulty
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block mined: " + this.hash);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]; //Array of blocks
    this.difficulty = 2; // Difficulty for proof of work algorithm
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  // Manually add the genesis block
  createGenesisBlock() {
    return new Block("01/01/2021", "Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  //   addBlock(newBlock) {
  //     newBlock.previousHash = this.getLatestBlock().hash; // Gets the Hash of the previous block
  //     newBlock.mineBlock(this.difficulty); // Generates a new block with hash that has the given difficulty
  //     this.chain.push(newBlock); // Adds it to the chain
  //   }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Is hash of the current block is still valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Is the block pointing to the correct previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

let bibiCoin = new Blockchain();
bibiCoin.createTransaction(new Transaction("address1", "address2", 100));
bibiCoin.createTransaction(new Transaction("address2", "address1", 50));

console.log("\n Starting the miner...");
bibiCoin.minePendingTransactions("bibis-address");

console.log(
  "\n Balance of bibi is",
  bibiCoin.getBalanceOfAddress("bibis-address")
);

console.log("\n Starting the miner again...");
bibiCoin.minePendingTransactions("bibis-address");

console.log(
  "\n Balance of bibi is",
  bibiCoin.getBalanceOfAddress("bibis-address")
);
