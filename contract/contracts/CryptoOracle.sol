// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CryptoOracle {
    struct CryptoData {
        uint256 price;
        uint256 marketCap;
        uint256 volume24h;
        uint256 lastUpdated;
        bool isActive;
    }
    
    mapping(string => CryptoData) public cryptoData;
    mapping(string => uint256) public lastUpdated;
    
    address public owner;
    address public gelatoAutomator;
    
    event CryptoDataUpdated(
        string indexed symbol,
        uint256 price,
        uint256 marketCap,
        uint256 volume24h,
        uint256 timestamp
    );
    
    modifier onlyAutomator() {
        require(msg.sender == gelatoAutomator, "Not authorized");
        _;
    }
    
    constructor(address _gelatoAutomator) {
        owner = msg.sender;
        gelatoAutomator = _gelatoAutomator;
    }
    
    function updateCryptoData(
        string memory symbol,
        uint256 price,
        uint256 marketCap,
        uint256 volume24h,
        uint256 timestamp
    ) external onlyAutomator {
        cryptoData[symbol] = CryptoData({
            price: price,
            marketCap: marketCap,
            volume24h: volume24h,
            lastUpdated: timestamp,
            isActive: true
        });
        
        lastUpdated[symbol] = timestamp;
        
        emit CryptoDataUpdated(symbol, price, marketCap, volume24h, timestamp);
    }
    
    function getCryptoData(string memory symbol) 
        external 
        view 
        returns (uint256, uint256, uint256, uint256) 
    {
        CryptoData memory data = cryptoData[symbol];
        return (data.price, data.marketCap, data.volume24h, data.lastUpdated);
    }
    
    function setGelatoAutomator(address _newAutomator) external {
        require(msg.sender == owner, "Only owner");
        gelatoAutomator = _newAutomator;
    }
}
