pragma solidity ^0.4.24;

import "../../ethereum-xcert/node_modules/@0xcert/ethereum-erc721/contracts/ownership/Ownable.sol";

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
  function Migrations()
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
