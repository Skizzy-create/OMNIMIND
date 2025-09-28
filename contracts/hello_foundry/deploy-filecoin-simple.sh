#!/bin/bash

# Simple Filecoin Testnet Deployment
echo "🚀 Deploying to Filecoin Testnet..."

# Set environment variables
export PRIVATE_KEY="41c80d358529c1ecddb851ef91cc44739bf7cac3f2910147e791f815b623312c"
export FILECOIN_RPC_URL="https://rpc.ankr.com/filecoin_testnet"

# Get deployer address
DEPLOYER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
echo "Deployer Address: $DEPLOYER_ADDRESS"

# Check balance
BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $FILECOIN_RPC_URL)
BALANCE_ETH=$(cast --to-unit $BALANCE ether)
echo "Balance: $BALANCE_ETH ETH"

# Check chain ID
CHAIN_ID=$(cast chain-id --rpc-url $FILECOIN_RPC_URL)
echo "Chain ID: $CHAIN_ID"

# Compile contracts
echo "🔨 Compiling contracts..."
forge build

# Deploy contracts
echo "🚀 Deploying contracts..."
forge script script/DeployFilecoinTestnet.s.sol:DeployFilecoinTestnet \
    --rpc-url $FILECOIN_RPC_URL \
    --broadcast \
    --verify \
    --slow \
    --legacy

echo "✅ Deployment completed!"
