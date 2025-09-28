#!/bin/bash

# Deploy to Anvil Filecoin Chain
echo "🚀 Deploying to Anvil Filecoin Chain..."

# Set environment variables
export PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
export ANVIL_RPC_URL="http://localhost:8545"

# Check if Anvil is running
echo "🔍 Checking if Anvil is running..."
if ! curl -s $ANVIL_RPC_URL > /dev/null; then
    echo "❌ Anvil is not running. Please start Anvil first:"
    echo "   anvil --chain-id 314"
    exit 1
fi

echo "✅ Anvil is running"

# Compile contracts
echo "🔨 Compiling contracts..."
forge build

# Deploy to Anvil Filecoin chain
echo "🚀 Deploying contracts to Anvil Filecoin chain..."
forge script script/DeployFilecoin.s.sol:DeployFilecoin \
    --rpc-url $ANVIL_RPC_URL \
    --broadcast \
    --verify \
    --slow

echo "✅ Deployment completed!"
echo "📄 Check filecoin-deployment-addresses.txt for contract addresses"
