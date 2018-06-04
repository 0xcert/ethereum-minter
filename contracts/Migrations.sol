pragma solidity ^0.4.24;

import "@0xcert/ethereum-utils/contracts/ownership/Ownable.sol";

/**
 * @title Migrations
 * @dev Migration contract.
 */
contract Migrations is Ownable {

  /**
   * @dev Last migration number.
   */
  uint public lastMigration;

  /**
   * @dev Contract constructor.
   */
  constructor()
    public
  {
    owner = msg.sender;
  }

  /**
   * @dev Sets last migration number.
   */
  function setCompleted(uint completed)
    onlyOwner
    public
  {
    lastMigration = completed;
  }

  /**
   * @dev Performs system upgrade.
   */
  function upgrade(address newAddress)
    onlyOwner
    public
  {
    Migrations upgraded = Migrations(newAddress);
    upgraded.setCompleted(lastMigration);
  }
}
