require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    avalanche: {
      url:"https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [PRIVATE_KEY],
    },

    fantom: {
      url : "https://rpc.testnet.fantom.network",
      chainId: 4002,
      accounts: [PRIVATE_KEY],
    },
  },
};
