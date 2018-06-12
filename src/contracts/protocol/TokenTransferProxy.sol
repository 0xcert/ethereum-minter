pragma solidity 0.4.24;

import "@0xcert/ethereum-erc20/contracts/tokens/ERC20.sol";
import "@0xcert/ethereum-utils/contracts/ownership/Ownable.sol";

/**
 * @title TokenTransferProxy - Transfers tokens on behalf of contracts that have been approved via
 * decentralized governance.
 * @dev Based on: https://github.com/0xProject/contracts/blob/master/contracts/TokenTransferProxy.sol
 */
contract TokenTransferProxy is 
  Ownable {

  /**
   * @dev Only authorized addresses can invoke functions with this modifier.
   */
  modifier onlyAuthorized {
    require(authorized[msg.sender]);
    _;
  }

  /**
   * @dev Only if target is autorized you can invoke functions with this modifier.
   */
  modifier targetAuthorized(address target) {
    require(authorized[target]);
    _;
  }

  /**
   * @dev Only if target is not autorized you can invoke functions with this modifier.
   */
  modifier targetNotAuthorized(address target) {
    require(!authorized[target]);
    _;
  }

  /**
   * @dev mapping of address to boolean state if authorized.
   */
  mapping (address => bool) public authorized;

  /**
   * @dev list of authorized addresses.
   */
  address[] public authorities;

  /**
   * @dev This emmits when a new address gets authorized.
   */
  event LogAuthorizedAddressAdded(
    address indexed target,
    address indexed caller
  );

  /**
   * @dev This emmits when an address gets its authorization revoked.
   */
  event LogAuthorizedAddressRemoved(
    address indexed target,
    address indexed caller
  );

  /**
   * @dev Authorizes an address.
   * @param target Address to authorize.
   */
  function addAuthorizedAddress(address target)
    public
    onlyOwner
    targetNotAuthorized(target)
  {
    authorized[target] = true;
    authorities.push(target);
    emit LogAuthorizedAddressAdded(target, msg.sender);
  }

  /**
   * @dev Removes authorizion of an address.
   * @param target Address to remove authorization from.
   */
  function removeAuthorizedAddress(address target)
    public
    onlyOwner
    targetAuthorized(target)
  {
    delete authorized[target];
    for (uint i = 0; i < authorities.length; i++) {
      if (authorities[i] == target) {
        authorities[i] = authorities[authorities.length - 1];
        authorities.length -= 1;
        break;
      }
    }
    emit LogAuthorizedAddressRemoved(target, msg.sender);
  }

  /**
   * @dev Calls into ERC20 Token contract, invoking transferFrom.
   * @param token Address of token to transfer.
   * @param from Address to transfer token from.
   * @param to Address to transfer token to.
   * @param value Amount of token to transfer.
   */
  function transferFrom(
    address token,
    address from,
    address to,
    uint value
  )
    public
    onlyAuthorized
    returns (bool)
  {
    return ERC20(token).transferFrom(from, to, value);
  }

  /**
   * @dev Gets all authorized addresses.
   * @return Array of authorized addresses.
   */
  function getAuthorizedAddresses()
    public
    constant
    returns (address[])
  {
    return authorities;
  }
}