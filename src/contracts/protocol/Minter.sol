pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;


import "@0xcert/ethereum-utils/contracts/math/SafeMath.sol";
import "@0xcert/ethereum-utils/contracts/utils/SupportsInterface.sol";
import "@0xcert/ethereum-utils/contracts/ownership/Ownable.sol";
import "@0xcert/ethereum-xcert/contracts/tokens/Xcert.sol";
import "@0xcert/ethereum-erc20/contracts/tokens/ERC20.sol";
import "./TokenTransferProxy.sol";
import "./XcertMintProxy.sol";

contract Minter is SupportsInterface
 {

  constructor()
    public
  {
  }

}
