// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AccessManager {
    mapping(uint256 => mapping(address => bool)) public datasetAccess;

    event AccessGranted(uint256 indexed datasetId, address indexed user);

    function grantAccess(uint256 _id, address _user) external {
        datasetAccess[_id][_user] = true;
        emit AccessGranted(_id, _user);
    }

    function hasAccess(uint256 _id, address _user) external view returns (bool) {
        return datasetAccess[_id][_user];
    }
}
