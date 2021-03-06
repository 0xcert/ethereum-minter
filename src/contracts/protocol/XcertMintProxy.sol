pragma solidity 0.4.24;

import "@0xcert/ethereum-xcert/contracts/tokens/Xcert.sol";
import "@0xcert/ethereum-utils/contracts/ownership/Ownable.sol";

/**
 * @title XcertMintProxy - Mints a token on behalf of contracts that have been approved via
 * decentralized governance.
 */
contract XcertMintProxy is 
  Ownable 
{
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
   * @dev Mints a new NFT.
   * @param _xcert Address of the Xcert contract on which the mint will be perfomed.
   * @param _to The address that will own the minted NFT.
   * @param _id The NFT to be minted by the msg.sender.
   * @param _uri An URI pointing to NFT metadata.
   * @param _proof Cryptographic asset imprint.
   * @param _config Array of protocol config values where 0 index represents token expiration
   * timestamp, other indexes are not yet definied but are ready for future xcert upgrades.
   * @param _data Array of convention data values.
   */
  function mint(
    address _xcert,
    address _to,
    uint256 _id,
    string _uri,
    string _proof,
    bytes32[] _config,
    bytes32[] _data
  )
    external
    onlyAuthorized
  {
    Xcert(_xcert).mint(_to, _id, _uri, _proof, _config, _data);
  }

  /**
   * @dev Gets all authorized addresses.
   * @return Array of authorized addresses.
   */
  function getAuthorizedAddresses()
    public
    view
    returns (address[])
  {
    return authorities;
  }
}