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
  /*
   * @dev contract addresses
   */
  address XCERT_MINT_PROXY_CONTRACT;
  address ERC20_TOKEN_CONTRACT;
  address TOKEN_TRANSFER_PROXY_CONTRACT;

  /*
   * @dev Sets XCT token address, Token proxy address and xcert Proxy address.
   * @param _xcertToken Address pointing to ERC20 Token contract.
   * @param _tokenTransferProxy Address pointing to TokenTransferProxy contract.
   * @param _XcertProxy Address pointing to XcertProxy contract.
   */
  constructor(
    address _erc20Token,
    address _tokenTransferProxy,
    address _xcertMintProxy
  )
    public
  {
    ERC20_TOKEN_CONTRACT = _erc20Token;
    TOKEN_TRANSFER_PROXY_CONTRACT = _tokenTransferProxy;
    XCERT_MINT_PROXY_CONTRACT = _xcertMintProxy;
    //supportedInterfaces[0xe0b725c2] = true; // Minter
  }

  /*
   * @dev Get address of token used in minter.
   */
  function getTokenAddress()
    external
    view
    returns (address)
  {
    return ERC20_TOKEN_CONTRACT;
  }

  /*
   * @dev Get address of token transfer proxy used in minter.
   */
  function getTokenTransferProxyAddress()
    external
    view
    returns (address)
  {
    return TOKEN_TRANSFER_PROXY_CONTRACT;
  }


  /*
   * @dev Get address of xcert mint proxy used in minter.
   */
  function getXcertMintProxyAddress()
    external
    view
    returns (address)
  {
    return XCERT_MINT_PROXY_CONTRACT;
  }
}
