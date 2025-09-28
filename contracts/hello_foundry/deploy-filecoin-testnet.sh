#!/bin/bash

# Deploy to Filecoin Testnet
echo "🚀 Deploying to Filecoin Testnet..."

# Set environment variables
export PRIVATE_KEY="41c80d358529c1ecddb851ef91cc44739bf7cac3f2910147e791f815b623312c"
export FILECOIN_RPC_URL="https://rpc.ankr.com/filecoin_testnet"

# Check if we have the required tools
echo "🔍 Checking deployment requirements..."

# Check if forge is available
if ! command -v forge &> /dev/null; then
    echo "❌ Forge not found. Please install Foundry first."
    echo "   Run: curl -L https://foundry.paradigm.xyz | bash"
    exit 1
fi

# Check if we have sufficient balance
echo "💰 Checking account balance..."
BALANCE=$(cast balance $(cast wallet address --private-key $PRIVATE_KEY) --rpc-url $FILECOIN_RPC_URL)
echo "Account balance: $BALANCE wei"

# Convert to ETH for display
BALANCE_ETH=$(cast --to-unit $BALANCE ether)
echo "Account balance: $BALANCE_ETH ETH"

# Check if balance is sufficient (at least 0.01 ETH)
MIN_BALANCE=10000000000000000  # 0.01 ETH in wei
if [ "$BALANCE" -lt "$MIN_BALANCE" ]; then
    echo "⚠️  Warning: Low balance detected. You may need to fund your account."
    echo "   Current balance: $BALANCE_ETH ETH"
    echo "   Recommended: At least 0.01 ETH for deployment"
fi

# Compile contracts
echo "🔨 Compiling contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Compilation successful"

# Deploy to Filecoin testnet
echo "🚀 Deploying contracts to Filecoin testnet..."
echo "RPC URL: $FILECOIN_RPC_URL"
echo "Chain ID: $(cast chain-id --rpc-url $FILECOIN_RPC_URL)"

forge script script/DeployFilecoinTestnet.s.sol:DeployFilecoinTestnet \
    --rpc-url $FILECOIN_RPC_URL \
    --broadcast \
    --verify \
    --slow \
    --legacy

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "📄 Check broadcast folder for deployment details"
    echo "🔗 View on Filecoin testnet explorer"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi

echo "🎉 Filecoin testnet deployment completed!"
