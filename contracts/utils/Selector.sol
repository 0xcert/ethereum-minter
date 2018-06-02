pragma solidity ^0.4.24;

import "../protocol/Minter.sol";

/**
 * @dev This contracts calculates interface id of Minter contracts as described in EIP165:
 * http://tiny.cc/uo23ty.
 * @notice See test folder for usage examples.
 */
contract Selector {

  /**
   * @dev Calculates and returns interface ID for the Minter smart contract.
   */
  function calculateMinterSelector()
    public
    pure
    returns (bytes4)
  {
    Minter i;
    return i.getTokenAddress.selector
      ^ i.getTokenTransferProxyAddress.selector
      ^ i.getXcertMintProxyAddress.selector
      ^ i.performMint.selector
      ^ i.cancelMint.selector
      ^ i.getMintDataClaim.selector
      ^ i.isValidSignature.selector;
  }
}