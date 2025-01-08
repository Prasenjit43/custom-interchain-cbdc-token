## Setup Instructions

### 1. Clone the Repository
Clone the repository using the following link:

```bash
git clone https://github.com/Prasenjit43/custom-interchain-cbdc-token.git
```

### 2. Create `.env` Files
Create two `.env` files:

- One in the `/custom-interchain-cbdc-token` directory
- Another in the `/custom-interchain-cbdc-token/token/` directory

### 3. Add Private Key
In both `.env` files, add your private key:

```
PRIVATE_KEY=XXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Install Dependencies for the Main Project
Run the following command from the `/custom-interchain-cbdc-token` directory:

```bash
npm install
```

### 5. Install Dependencies for the Token Contract
Run the following command from the `/custom-interchain-cbdc-token/token/` directory:

```bash
npm install
```

### 6. Test Scripts
Use the following commands to test different scenarios:

- **Deploy Token Manager and Add a Minter:**
  ```bash
  FUNCTION_NAME=deployTokenManagerAndAddAMinter_Avalance npx hardhat run index.js --network avalanche  
  ```

- **Mint and Approve:**
  ```bash
  FUNCTION_NAME=mintAndApproveITS npx hardhat run index.js --network avalanche  
  ```

- **Deploy Token Manager Remotely:**
  ```bash
  FUNCTION_NAME=deployTokenManagerRemotely_Fantom npx hardhat run index.js --network avalanche
  ```

- **Transfer Tokens:**
  ```bash
  FUNCTION_NAME=transferTokens npx hardhat run index.js --network avalanche
  ```
