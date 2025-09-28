// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DummyVerifier {
    event DataVerified(string hash, bool result);

    function verifyData(string memory hash) external returns (bool) {
        // Dummy logic — accept all data that starts with a letter
        bool isValid = bytes(hash).length > 0;
        emit DataVerified(hash, isValid);
        return isValid;
    }
}
