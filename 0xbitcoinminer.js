var web3utils =  require('web3-utils');
var solidityHelper = require('./solidity-helper')
var leftpad =  require('leftpad');

const BN = require('bn.js');

var tokenContractJSON = require('./contracts/_0xBitcoinToken.json');

var cpuminer = require('./cpuminer/build/Release/cpuminer');

var tokenContract;

const PRINT_STATS_TIMEOUT = 60000;

// Warning: safe timeout for a local node ONLY
const COLLECT_CONTRACT_DATA_TIMEOUT = 100;


module.exports =  {

    async init(web3, subsystem_command, vault, networkInterface, miningLogger)
    {

      process.on('exit', () => {
        console.log("Process exiting... stopping miner");
        cpuminer.stop();
      });

      tokenContract =  new web3.eth.Contract(tokenContractJSON.abi,vault.getTokenContractAddress());

      this.miningLogger = miningLogger;
      this.networkInterface = networkInterface;
      this.vault = vault;

      var eth_account  = vault.getAccount();
      console.log('Selected mining account:', eth_account);

      if (eth_account ==  null || eth_account.address == null)
      {
        console.log("Please create a new account with 'account new' before mining.")
        return false;
      }

      this.mining = true; // to prevent start of mining before end of func
      var self = this;
      var minerEthAddress = eth_account.address;

      let contractData = {}; //passed around as a reference and edited globally

      this.mineStuff = function(contractData) {
        if (!this.mining) {
          this.mineCoins(web3, contractData, minerEthAddress);
        }
      }

      await self.collectDataFromContract(contractData);

      setInterval(() => {self.collectDataFromContract(contractData)}, COLLECT_CONTRACT_DATA_TIMEOUT);

      this.miningLogger.appendToStandardLog("Begin mining for " + minerEthAddress + " @ gasprice " + vault.getGasPriceGwei());

      console.log("Mining for  "+ minerEthAddress);
      console.log("Gas price is "+ vault.getGasPriceGwei() + ' gwei');
      // console.log("Configured CPU threadcount is "+ vault.getNumThreads() )

      setInterval(() => { self.printMiningStats() }, PRINT_STATS_TIMEOUT);

      // let's mine!
      this.mining = false;
      this.mineStuff(contractData);
    },

    async collectDataFromContract(contractData)
    {
      try {
        const miningDifficultyString = await tokenContract.methods.getMiningDifficulty().call();
        const miningDifficulty = parseInt(miningDifficultyString);

        const miningTargetString = await tokenContract.methods.getMiningTarget().call();
        const miningTarget = web3utils.toBN(miningTargetString)

        const challengeNumber = await tokenContract.methods.getChallengeNumber().call();

        let bResume = false;

        if (!contractData.challengeNumber || contractData.challengeNumber != challengeNumber) {
          console.log("New challenge number: " + challengeNumber);
          cpuminer.setChallengeNumber(challengeNumber);
          bResume = true;
        }
        if (!contractData.miningTarget || contractData.miningTarget.cmp(miningTarget) != 0) {
          console.log("New mining target: 0x" + miningTarget.toString(16));
          cpuminer.setDifficultyTarget("0x" + miningTarget.toString(16));
        }
        if (!contractData.miningDifficulty || contractData.miningDifficulty != miningDifficulty) {
          console.log("New difficulty: " + miningDifficulty);
        }

        contractData.challengeNumber = challengeNumber;
        contractData.miningTarget = miningTarget;
        contractData.miningDifficulty = miningDifficulty;

        if (bResume && !this.mining) {
          console.log("Resuming mining operations with new challenge");
          this.mineStuff(contractData);
        }

      } catch (e) {
        console.error("cannot retrieve contract info", e);
      }
      return contractData;
    },

    async submitNewMinedBlock(addressFrom, solution_number, digest_bytes, challenge_number)
    {
       this.miningLogger.appendToStandardLog("Giving mined solution to network interface " + challenge_number);

       this.networkInterface.queueMiningSolution(addressFrom, solution_number , digest_bytes , challenge_number)
    },

    mineCoins(web3, contractData , minerEthAddress)
    {
      cpuminer.setMinerAddress(minerEthAddress);

      var self = this;

      const verifyAndSubmit = (solution_number) => {
        const challenge_number = contractData.challengeNumber;
        const digest = web3utils.sha3(challenge_number + minerEthAddress.substring(2) + solution_number.substring(2));
        const digestBigNumber = web3utils.toBN(digest);
        if (digestBigNumber.lte(contractData.miningTarget)) {
          console.log('Submit mined solution for challenge ', challenge_number);
          self.submitNewMinedBlock(minerEthAddress, solution_number, digest, challenge_number);
        } else {
          console.error("Verification failed!\n",
            "challenge: ", challenge_number, "\n",
            "address: ", minerEthAddress, "\n",
            "solution: ", solution_number, "\n",
            "digest: ", digestBigNumber, "\n",
            "target: ", contractData.miningTarget);
        }
      }

      self.mining = true;
      cpuminer.run( (err, sol) => {
        if (sol) {
          console.log("Solution found!");
          verifyAndSubmit(sol);
        }
        console.log("Stopping mining operations for the moment...");
        self.mining = false;
      });
    },


    printMiningStats()
    {
      console.log('Hash rate: ' + parseInt(cpuminer.hashes() / PRINT_STATS_TIMEOUT) + " kH/s");
    }


}
