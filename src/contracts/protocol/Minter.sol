pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "@0xcert/ethereum-utils/contracts/math/SafeMath.sol";
import "@0xcert/ethereum-utils/contracts/utils/SupportsInterface.sol";
import "@0xcert/ethereum-utils/contracts/ownership/Ownable.sol";
import "@0xcert/ethereum-xcert/contracts/tokens/Xcert.sol";
import "@0xcert/ethereum-erc20/contracts/tokens/ERC20.sol";
import "./TokenTransferProxy.sol";
import "./XcertMintProxy.sol";

/**
 @dev Contract for decetralized minting of NFTs. 
 */
contract Minter is
  SupportsInterface
{
  using SafeMath for uint256;

  /*
   * @dev contract addresses
   */
  address XCERT_MINT_PROXY_CONTRACT;
  address ERC20_TOKEN_CONTRACT;
  address TOKEN_TRANSFER_PROXY_CONTRACT;

  /*
   * @dev Mapping of all canceled mints.
   */
  mapping(bytes32 => bool) public mintCancelled;

  /*
   * @dev Mapping of all performed mints.
   */
  mapping(bytes32 => bool) public mintPerformed;

  /**
   * @dev Structure of Xcert data.
   */
  struct XcertData{
    address xcert;
    uint256 id;
    string proof;
    string uri;
    bytes32[] config;
    bytes32[] data;
  }

  /**
   * @dev Struture of fee data.
   */
  struct Fee{
    address feeAddress;
    uint256 feeAmount;
  }

  /** 
   * @dev Structure of data needed for mint.
   */
  struct MintData{
    address owner;
    address to;
    Fee[] fees;
    uint256 seed;
    uint256 expirationTimestamp;
  }

  /**
   * @dev Structure representing the signature parts.
   */
  struct Signature{
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  /*
   * @dev This event emmits when xcert gets mint directly to the taker.
   * @param _to Address of the xcert recipient.
   * @param _xcert Address of the xcert contract.
   * @param _xcertMintClaim Claim of the mint.
   */
  event PerformMint(
    address _to,
    address indexed _xcert,
    bytes32 _xcertMintClaim
  );

  /*
   * @dev This event emmits when xcert mint order is canceled.
   * @param _to Address of the xcert recipient.
   * @param _xcert Address of the xcert contract.
   * @param _xcertMintClaim Claim of the mint.
   */
  event CancelMint(
    address _to,
    address indexed _xcert,
    bytes32 _xcertMintClaim
  );

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

  /*
   * @dev Calculates keccak-256 hash of mint data from parameters.
   * @param _mintData Data needed for minting trough minter.
   * @param _xcertData Data needed for minting a new Xcert.
   * @returns keccak-hash of mint data.
   */
  function getMintDataClaim(
    MintData _mintData,
    XcertData _xcertData
  )
    public
    view
    returns (bytes32)
  {
    return keccak256(
      abi.encodePacked(
        address(this),
        _mintData.to,
        _xcertData.xcert,
        _xcertData.id,
        _xcertData.proof,
        _xcertData.uri,
        _xcertData.config,
        _xcertData.data,
        _mintData.fees,
        _mintData.seed,
        _mintData.expirationTimestamp
      )
    );
  }

  /*
   * @dev Verifies if claim signature is valid.
   * @param _signer address of signer.
   * @param _claim Signed Keccak-256 hash.
   * @param _signature Signature data.
   * @return Validity of signature.
   */
  function isValidSignature(
    address _signer,
    bytes32 _claim,
    Signature _signature
  )
    public
    pure
    returns (bool)
  {
    return _signer == ecrecover(
      keccak256(
        abi.encodePacked(
          "\x19Ethereum Signed Message:\n32",
          _claim
        )
      ),
      _signature.v,
      _signature.r,
      _signature.s
    );
  }
}
