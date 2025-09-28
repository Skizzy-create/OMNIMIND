#!/bin/bash

# Advanced Filecoin Testnet Deployment Script
echo "🚀 Advanced Filecoin Testnet Deployment"
echo "========================================"

# Configuration
PRIVATE_KEY="41c80d358529c1ecddb851ef91cc44739bf7cac3f2910147e791f815b623312c"
RPC_URL="https://rpc.ankr.com/filecoin_testnet"
DEPLOYER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)

echo "📋 Deployment Configuration:"
echo "  Deployer Address: $DEPLOYER_ADDRESS"
echo "  RPC URL: $RPC_URL"
echo "  Chain ID: $(cast chain-id --rpc-url $RPC_URL)"
echo ""

# Function to check command availability
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 not found. Please install it first."
        exit 1
    fi
}

# Function to check balance
check_balance() {
    local balance=$(cast balance $DEPLOYER_ADDRESS --rpc-url $RPC_URL)
    local balance_eth=$(cast --to-unit $balance ether)
    
    echo "💰 Account Balance: $balance_eth ETH"
    
    # Check if balance is sufficient (at least 0.005 ETH)
    local min_balance=5000000000000000  # 0.005 ETH in wei
    if [ "$balance" -lt "$min_balance" ]; then
        echo "⚠️  Warning: Low balance detected!"
        echo "   Current: $balance_eth ETH"
        echo "   Recommended: At least 0.005 ETH"
        echo "   You may need to fund your account from a faucet."
        echo ""
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Deployment cancelled."
            exit 1
        fi
    fi
}

# Function to estimate gas
estimate_gas() {
    echo "⛽ Estimating gas costs..."
    
    # Create a temporary script to estimate gas
    cat > /tmp/estimate_gas.s.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DataRegistry.sol";
import "../src/DataNFT.sol";
import "../src/DummyVerifier.sol";
import "../src/AccessManager.sol";
import "../src/DataCoin.sol";

contract EstimateGas is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        DataCoin dataCoin = new DataCoin();
        DataNFT dataNFT = new DataNFT();
        DummyVerifier verifier = new DummyVerifier();
        AccessManager accessManager = new AccessManager();
        DataRegistry dataRegistry = new DataRegistry(
            address(dataNFT),
            address(verifier),
            address(accessManager),
            address(dataCoin)
        );

        dataNFT.transferOwnership(address(dataRegistry));
        dataCoin.transferOwnership(address(dataRegistry));

        vm.stopBroadcast();
    }
}
EOF

    # Run gas estimation
    forge script /tmp/estimate_gas.s.sol:EstimateGas \
        --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --gas-estimate-only

    # Clean up
    rm -f /tmp/estimate_gas.s.sol
}

# Function to deploy contracts
deploy_contracts() {
    echo "🚀 Starting contract deployment..."
    echo ""
    
    # Set environment variables
    export PRIVATE_KEY=$PRIVATE_KEY
    
    # Deploy with comprehensive options
    forge script script/DeployFilecoinTestnet.s.sol:DeployFilecoinTestnet \
        --rpc-url $RPC_URL \
        --broadcast \
        --verify \
        --slow \
        --legacy \
        --gas-estimate-multiplier 120 \
        --gas-limit 30000000 \
        --gas-price 2000000000
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."
    
    # Get the latest broadcast file
    local broadcast_dir="broadcast/DeployFilecoinTestnet.s.sol"
    local latest_run=$(ls -t $broadcast_dir/*/run-latest.json 2>/dev/null | head -1)
    
    if [ -f "$latest_run" ]; then
        echo "✅ Deployment artifacts found: $latest_run"
        
        # Extract contract addresses
        echo "📋 Contract Addresses:"
        jq -r '.transactions[] | select(.contractName != null) | "\(.contractName): \(.contractAddress)"' "$latest_run" 2>/dev/null || echo "Could not parse contract addresses"
    else
        echo "⚠️  No deployment artifacts found"
    fi
}

# Function to create deployment summary
create_summary() {
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    local chain_id=$(cast chain-id --rpc-url $RPC_URL)
    
    cat > filecoin-testnet-deployment-summary.md << EOF
# Filecoin Testnet Deployment Summary

**Deployment Date:** $timestamp  
**Chain ID:** $chain_id  
**Deployer:** $DEPLOYER_ADDRESS  
**RPC URL:** $RPC_URL  

## Contract Addresses
*To be updated after successful deployment*

## Deployment Status
- [ ] DataCoin
- [ ] DataNFT  
- [ ] DummyVerifier
- [ ] AccessManager
- [ ] DataRegistry

## Next Steps
1. Verify contracts on Filecoin testnet explorer
2. Update frontend with new contract addresses
3. Test contract interactions
4. Deploy to mainnet when ready

EOF

    echo "📄 Deployment summary created: filecoin-testnet-deployment-summary.md"
}

# Main execution
main() {
    echo "🔧 Checking requirements..."
    check_command "forge"
    check_command "cast"
    check_command "jq"
    
    echo "✅ All requirements met"
    echo ""
    
    # Check balance
    check_balance
    echo ""
    
    # Estimate gas
    estimate_gas
    echo ""
    
    # Create deployment summary
    create_summary
    echo ""
    
    # Deploy contracts
    deploy_contracts
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment completed successfully!"
        verify_deployment
        echo ""
        echo "🎉 Filecoin testnet deployment completed!"
        echo "📄 Check the broadcast folder for detailed transaction information"
        echo "🔗 View transactions on Filecoin testnet explorer"
    else
        echo ""
        echo "❌ Deployment failed!"
        echo "Please check the error messages above and try again."
        exit 1
    fi
}

# Run main function
main "$@"
