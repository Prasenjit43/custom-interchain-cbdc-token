const {BigNumber} = require("ethers")
const hre = require("hardhat");
const crypto = require("crypto");
const {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
  CHAINS,
} = require("@axelar-network/axelarjs-sdk");
const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

const interchainTokenServiceContractABI_Avalanche = require("./utils/interchainTokenServiceABI_Avalanche");
const interchainTokenServiceContractABI_Fantom = require("./utils/interchainTokenServiceABI_Fantom");
const interchainTokenContractABI = require("./utils/interchainTokenABI");

const interchainTokenServiceContractAddress ="0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C";
const avalancheTokenAddress = "0x4f54b4Eee8726F6010A9A8bF6D4aCC30177584C8";
const fantomTokenAddress = "0x9b6b4c5394341537b215BE1286BB8F0E6e26F3B1";

const LOCK_UNLOCK_FEE = 3;
const MINT_BURN = 4;

async function getContractInstance(contractAddress, contractABI, signer) {
  return new ethers.Contract(contractAddress, contractABI, signer);
}

async function getSigner() {
  const [signer] = await ethers.getSigners();
  return signer;
}

// deploy Token Manager : Avalanche
async function deployTokenManagerAndAddAMinter_Avalance() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  // Get the InterchainTokenService contract instance
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI_Avalanche,
    signer
  );

  const interchainTokenContract = await getContractInstance(
    avalancheTokenAddress,
    interchainTokenContractABI,
    signer
  );

  // Generate a random salt
  const salt = "0x" + crypto.randomBytes(32).toString("hex");

  // Create the params
  const params = ethers.utils.defaultAbiCoder.encode(
    ["bytes", "address"],
    [signer.address, avalancheTokenAddress]
  );

  // Deploy the token manager
  const deployTxData = await interchainTokenServiceContract.deployTokenManager(
    salt,
    "",
    LOCK_UNLOCK_FEE,
    params,
    ethers.utils.parseEther("0.01")
  );

  // Get the tokenId
  const tokenId = await interchainTokenServiceContract.interchainTokenId(
    signer.address,
    salt
  );

  // Get the token manager address
  const expectedTokenManagerAddress =
    await interchainTokenServiceContract.tokenManagerAddress(tokenId);

  // Add token manager as a minter
  // await interchainTokenContract.addMinter(expectedTokenManagerAddress);

  console.log(
    ` 
        Salt: ${salt},
        Transaction Hash: ${deployTxData.hash},
        Token ID: ${tokenId}, 
        Expected Token Manager Address: ${expectedTokenManagerAddress},
      `
  );
}

// Mint and approve ITS
async function mintAndApproveITS() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  // Get the InterchainToken contract instance
  const interchainTokenContract = await getContractInstance(
    avalancheTokenAddress,
    interchainTokenContractABI,
    signer
  );

  // Mint tokens
  await interchainTokenContract.mint(
    signer.address,
    ethers.utils.parseEther("1000")
  );

  // // Approve ITS
  await interchainTokenContract.approve(
    interchainTokenServiceContractAddress, // ITS address
    ethers.utils.parseEther("1000")
  );

  //set salt
  await interchainTokenContract.setItsSalt(
    "0x22be49e501cd1d6173cf7c647f8bd83560e2fc60de530a6bf9885480bfdbb06d"
  );

  console.log("Minting and Approving ITS successful!");
}

// Estimate gas costs.
async function gasEstimator() {
  const gas = await api.estimateGasFee(
    EvmChain.AVALANCHE,
    EvmChain.FANTOM,
    30000000,
    // "auto",
    1.5,
    GasToken.AVAX
  );

  return gas;
}

// deploy Token Manager : Fantom
async function deployTokenManagerRemotely_Fantom() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  // Get the InterchainTokenService contract instance
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI_Fantom,
    signer
  );

  const interchainTokenContract = await getContractInstance(
    fantomTokenAddress,
    interchainTokenContractABI,
    signer
  );

  // Create the params
  const params = ethers.utils.defaultAbiCoder.encode(
    ["bytes", "address"],
    [signer.address, fantomTokenAddress]
  );

  const gasAmount = await gasEstimator();
  console.log("Gas Amount :", gasAmount);

  // Deploy the token manager remotely
  const deployTxData = await interchainTokenServiceContract.deployTokenManager(
    "0x22be49e501cd1d6173cf7c647f8bd83560e2fc60de530a6bf9885480bfdbb06d", // salt
    "Fantom",
    MINT_BURN,
    params,
    ethers.utils.parseEther("0.01"),
    { value: gasAmount }
  );

  // Get the tokenId
  const tokenId = await interchainTokenServiceContract.interchainTokenId(
    signer.address,
    "0x22be49e501cd1d6173cf7c647f8bd83560e2fc60de530a6bf9885480bfdbb06d" // salt
  );

  // Get the token manager address
  const expectedTokenManagerAddress =
    await interchainTokenServiceContract.tokenManagerAddress(tokenId);

  // Add token manager as a minter
  // await interchainTokenContract.addMinter(expectedTokenManagerAddress);

  console.log(
    ` 
        Transaction Hash: ${deployTxData.hash},
        Token ID: ${tokenId}, 
        Expected Token Manager Address: ${expectedTokenManagerAddress},
      `
  );
}

// Transfer mint access on all chains to the Expected Token Manager : Avalanche
async function transferMintAccessToTokenManagerOnAvalance() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  const avalancheTokenContract = await getContractInstance(
    avalancheTokenAddress,
    interchainTokenContractABI,
    signer,
  );

  const addMinterTxn = await avalancheTokenContract.addMinter("0x7BA0c1F8c9780146fa115302f48A5E20677E0ae2");  //replace Token manager address
  console.log("grantRoleTxn: ", addMinterTxn.hash);
}

// Transfer mint access on all chains to the Expected Token Manager Address : Fantom
async function transferMintAccessToTokenManagerOnFantom() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  const tokenContract = await getContractInstance(
    fantomTokenAddress,
    interchainTokenContractABI,
    signer,
  );

  const addMinterTxn = await tokenContract.addMinter("0x7BA0c1F8c9780146fa115302f48A5E20677E0ae2"); //replace Token manager address
  console.log("grantRoleTxn: ", addMinterTxn.hash);
}

// Transfer tokens : Avalanche -> Fantom
async function transferTokens() {
  // Get a signer to sign the transaction
  const signer = await getSigner();

  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI_Avalanche,
    signer
  );

  const gasAmount = await gasEstimator();
  console.log("gasamount :", gasAmount);
  const balanceInEth= ethers.utils.formatEther(gasAmount);
  console.log("gasamount in eth:", balanceInEth); 

  const transfer = await interchainTokenServiceContract.interchainTransfer(
    "0x211886dfb8dcf652329a73e09f8672c87746fa07b6881f1c656b6f22fb27a44b", // tokenId, the one you store in the earlier step
    "Fantom",
    "0x874ff354224aa76f59e9779ac277a4F7d334017f", // receiver address
    ethers.utils.parseEther("10"), // amount of token to transfer
    "0x", // data
    ethers.utils.parseEther("0.03"), // fee
    //  gasAmount,
    {
      value : ethers.utils.parseEther("0.03")
    }
  );
  console.log("Transfer Transaction Hash:", transfer.hash);
}

async function main() {
  const functionName = process.env.FUNCTION_NAME;
  switch (functionName) {
    case "deployTokenManagerAndAddAMinter_Avalance":
      await deployTokenManagerAndAddAMinter_Avalance();
      break;
    case "mintAndApproveITS":
      await mintAndApproveITS();
      break;
    case "deployTokenManagerRemotely_Fantom":
      await deployTokenManagerRemotely_Fantom();
      break;
    case "transferMintAccessToTokenManagerOnAvalance":
      await transferMintAccessToTokenManagerOnAvalance();
      break;
    case "transferMintAccessToTokenManagerOnFantom":
      await transferMintAccessToTokenManagerOnFantom();
      break;
    case "transferTokens":
      await transferTokens();
      break;
    default:
      console.error(`Unknown function: ${functionName}`);
      process.exitCode = 1;
      return;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
