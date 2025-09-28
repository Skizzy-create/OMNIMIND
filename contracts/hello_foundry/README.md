# Data Registry Smart Contracts

A comprehensive smart contract system for managing datasets with NFT representation, verification, access control, and reward mechanisms.

## Contracts Overview

### 1. DataRegistry.sol
The main contract that orchestrates the entire system:
- Manages dataset registration and metadata
- Handles verification through DummyVerifier
- Mints NFTs for registered datasets
- Manages access permissions
- Rewards contributors with DataCoin tokens

### 2. DataNFT.sol
ERC721 token contract representing datasets:
- Each dataset gets a unique NFT
- Uses OpenZeppelin's ERC721URIStorage
- Minted automatically when datasets are registered

### 3. DummyVerifier.sol
Verification contract for dataset integrity:
- Currently accepts all non-empty hashes
- Can be replaced with more sophisticated verification logic
- Emits verification events

### 4. DataCoin.sol
ERC20 reward token for contributors:
- Initial supply: 1,000,000 DATA tokens
- Used to reward verified dataset contributors
- 100 DATA tokens per verified dataset

### 5. AccessManager.sol
Manages dataset access permissions:
- Dataset owners can grant access to specific addresses
- Simple boolean mapping for access control
- Emits access grant events

## Features

- ✅ **Dataset Registration**: Register datasets with metadata
- ✅ **NFT Representation**: Each dataset becomes an NFT
- ✅ **Verification System**: Verify dataset integrity (dummy implementation)
- ✅ **Access Control**: Grant/revoke access to datasets
- ✅ **Reward System**: Automatic DATA token rewards for verified datasets
- ✅ **Comprehensive Testing**: Full test coverage with Foundry
- ✅ **Deployment Scripts**: Ready-to-use deployment scripts

## Testing

All contracts are thoroughly tested with Foundry. Run tests with:

```bash
forge test --match-contract DataRegistryTest
```

Test coverage includes:
- Contract deployment and initialization
- Dataset registration and metadata storage
- NFT minting and ownership
- Dataset verification and rewards
- Access control mechanisms
- Event emissions
- Error handling and edge cases

## Deployment

### Local Development
For local testing with Anvil:

```bash
forge script script/DeployLocal.s.sol
```

### Production Deployment
For production deployment:

1. Set your private key in environment:
```bash
export PRIVATE_KEY=your_private_key_here
```

2. Deploy to your target network:
```bash
forge script script/DeployDataRegistry.s.sol --rpc-url YOUR_RPC_URL --broadcast
```

## Contract Addresses (Local Deployment)

When deployed locally, contracts will be at these addresses:
- **DataCoin**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **DataNFT**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **DummyVerifier**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **AccessManager**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **DataRegistry**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

## Usage Examples

### Register a Dataset
```solidity
// Register a new dataset
dataRegistry.registerDataset(
    "My Dataset", 
    "QmHashOfMyDataset123"
);
```

### Verify a Dataset
```solidity
// Verify dataset with ID 1
dataRegistry.verifyDataset(1);
```

### Grant Access
```solidity
// Grant access to user for dataset 1
dataRegistry.grantAccess(1, userAddress);
```

## Security Considerations

- All ownership transfers are handled securely
- Access control is enforced at the contract level
- Verification can be upgraded to use more sophisticated methods
- Token rewards are automatically minted to prevent inflation issues

## Future Enhancements

- Replace DummyVerifier with zkTLS or other cryptographic proofs
- Add dataset pricing and marketplace functionality
- Implement more sophisticated access control (time-based, role-based)
- Add dataset versioning and updates
- Integrate with IPFS/Filecoin for actual file storage

## Dependencies

- OpenZeppelin Contracts v5.4.0
- Foundry for testing and deployment
- Solidity ^0.8.20