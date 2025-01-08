const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployModule", (m) => {
  // Deploy Token contract
  const CustomCBDCToken = m.contract("CustomCBDCToken", [
    "CBDC Token",
    "CBDCT",
    18,
    "50000000000000000", // 0.05 ETH
    "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C" //Interchain Token Service Contract Address
  ]);

  return {
    CustomCBDCToken,
  };
});

 