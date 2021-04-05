const crypto = require("crypto"); //Hash function
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // Algorithm basis for bitcoin

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  // Hash calculator done with SHA256
  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(this.fromAddress + this.toAddress + this.amount + this.timestamp)
      .digest("hex");
  }

  // Signs a transaction with the given Elliptic keypair value
  signTransaction(signinKey) {
    if (signinKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("You cannot sign transactions for other wallets!");
    }

    // Calculate the hash of this transaction
    const hashTx = this.calculateHash();
    const sig = signinKey.sign(hashTx, "base64"); // Sign the hash of the transaction with base64
    this.signature = sig.toDER("hex");
  }

  // Validation check
  isValid() {
    if (this.fromAddress === null) return true; // Check to see the from address is null (mining reward) so, valid

    // Check to see if there is a signature
    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.calculateHash(), this.signature); //verify that he hash for the given block was signed by this.signature
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
    return crypto
      .createHash("sha256")
      .update(
        this.previousHash +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.nonce
      )
      .digest("hex");
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

  // Runs validation on all transactions inside the block
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }

    return true;
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
    return new Block(Date.parse("2021-01-01"), [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to address");
    }

    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }

    if (transaction.amount <= 0) {
      throw new Error("Transaction amount should be higher than  0");
    }

    // Need to make sure the amount sent is not greater than existing balance
    if (
      this.getBalanceOfAddress(transaction.fromAddress) > transaction.amount
    ) {
      throw new Error("Not enough balance");
    }

    this.pendingTransactions.push(transaction);
    console.log(`Transaction added: ${transaction}`);
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

  getAllTransactionsForWallet(address) {
    const trans = [];

    for (const block of this.chain) {
      for (const tran of block.transactions) {
        if (tran.fromAddress === address || tran.toAddress === address) {
          trans.push(tran);
        }
      }
    }
    return trans;
  }

  // Validity check for all blocks on the chain.
  isChainValid() {
    // Checks if genesis block has not been tampered with
    const trueGenesis = JSON.stringify(this.createGenesisBlock());

    if (trueGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      // Is hash of the current block is still valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.block = Block;
module.exports.Transaction = Transaction;
