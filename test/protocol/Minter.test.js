const Minter = artifacts.require('Minter');
const TokenTransferProxy = artifacts.require('TokenTransferProxy');
const XcertMintProxy = artifacts.require('XcertMintProxy');
const Xcert = artifacts.require('XcertMock');
const Zxc = artifacts.require('Zxc');
const util = require('ethjs-util');
const web3Util = require('web3-utils');
const assertRevert = require('../helpers/assertRevert');

contract('Minter', (accounts) => {
  let minter;
  let tokenProxy;
  let mintProxy;
  let token;
  let xcert
  const id1 = web3.sha3('test1');
  const id2 = web3.sha3('test2');
  const id3 = web3.sha3('test3');
  const uri = "www.test.com"
  const mockProof = '1e205550c271490347e5e2393a02e94d284bbe9903f023ba098355b8d75974c8';
  const config = [web3Util.padLeft(web3Util.numberToHex(1821195657), 64)];
  const data = [web3Util.padLeft(web3Util.numberToHex(3), 64)];

  beforeEach(async () => {
    tokenProxy = await TokenTransferProxy.new();
    mintProxy = await XcertMintProxy.new();
    token = await Zxc.new();
    xcert = await Xcert.new('Foo', 'F', '0xa65de9e6');

    await token.enableTransfer();
    await token.transfer(accounts[1], 200);
    await token.transfer(accounts[2], 200);
    await token.transfer(accounts[3], 200);

    minter = await Minter.new(token.address, tokenProxy.address, mintProxy.address);
    tokenProxy.addAuthorizedAddress(minter.address);
    mintProxy.addAuthorizedAddress(minter.address);
  });

  describe('contract addresses', function () {
    it('check if token address is correct', async () => {
      let address = await minter.getTokenAddress();
      assert.equal(address, token.address);
    });

    it('check if token transfer proxy address is correct', async () => {
      let address = await minter.getTokenTransferProxyAddress();
      assert.equal(address, tokenProxy.address);
    });

    it('check if xcert mint proxy address is correct', async () => {
      let address = await minter.getXcertMintProxyAddress();
      assert.equal(address, mintProxy.address);
    });
  });

  describe('hashing', function () {
    let testArrayAccount = [accounts[3], accounts[5]];
    let testArrayAmount = [1, 10];

    let timestamp = 1521195657;
    let expirationTimestamp = 1821195657;

    let claimAccountArray =[accounts[1], accounts[2], accounts[3], accounts[5]];
    let claimUintArray = [id1, timestamp, expirationTimestamp, 1, 1, 10];
    let claimBytesArray = ["0x1", "0x3", config[0], data[0]];

    let contractHash;

    beforeEach(async () => {
      contractHash = await minter.getMintDataClaim(claimAccountArray, claimUintArray, claimBytesArray, mockProof, uri);
    });

    it('compares the same local and contract hash', async () => {
      let localHash = web3Util.soliditySha3(minter.address, accounts[1], accounts[2], id1, mockProof, uri,
        {t: 'bytes32[]', v:config}, {t: 'bytes32[]', v:data},
        {t: 'address[]', v:testArrayAccount}, {t: 'uint256[]', v:testArrayAmount}, timestamp, expirationTimestamp);
      assert.equal(contractHash, localHash);
    });

    it('compares different local and contract hash', async () => {
       let localHash = web3Util.soliditySha3(minter.address, accounts[1], accounts[2], id1, mockProof, uri,
        {t: 'bytes32[]', v:config}, {t: 'bytes32[]', v:data},
        {t: 'address[]', v:testArrayAccount}, {t: 'uint256[]', v:testArrayAmount}, timestamp, 34);
      assert.notEqual(contractHash, localHash);
    });
  });

  describe('signature', function () {
    let hash;
    let r;
    let s;
    let v;

    let timestamp = 1521195657;
    let expirationTimestamp = 1821195657;
    let claimAccountArray =[accounts[1], accounts[2], accounts[3], accounts[5]];
    let claimUintArray = [id1, timestamp, expirationTimestamp, 1, 1, 10];
    let claimBytesArray = ["0x1", "0x3", config[0], data[0]];

    beforeEach(async () => {
      hash = await minter.getMintDataClaim(claimAccountArray, claimUintArray, claimBytesArray, mockProof, uri);
      let signature = web3.eth.sign(accounts[0], hash);

      r = signature.substr(0, 66);
      s = '0x' + signature.substr(66, 64);
      v = parseInt('0x' + signature.substr(130, 2)) + 27;
    });

    it('correctly validates correct signer', async () => {
      let valid = await minter.isValidSignature(accounts[0], hash, v, r, s);
      assert.equal(valid, true);
    });

    it('correctly validates wrong signer', async () => {
      let valid = await minter.isValidSignature(accounts[1], hash, v, r, s);
      assert.equal(valid, false);
    });

    it('correctly validates wrong signature data', async () => {
      let valid = await minter.isValidSignature(accounts[0], hash, 1, 2, 3);
      assert.equal(valid, false);
    });

    it('correctly validates signature data from another account', async () => {
      let signature = web3.eth.sign(accounts[1], hash);

      r = signature.substr(0, 66);
      s = '0x' + signature.substr(66, 64);
      v = parseInt('0x' + signature.substr(130, 2)) + 27;

      let valid = await minter.isValidSignature(accounts[0],hash,v,r,s);
      assert.equal(valid, false);

      valid = await minter.isValidSignature(accounts[1],hash,v,r,s);
      assert.equal(valid, true);
    });
  });

  describe('mint', function () {

    let r;
    let s;
    let v;
    let timestamp = 1521195657;
    let expirationTimestamp = 1821195657;
    let addressArray = [accounts[1]];
    let amountArray = [20];
    let owner = accounts[0];
    let to = accounts[2];
    let thirdParty = accounts[3];

    let mintAddressArray;
    let mintUintArray;
    let mintByteArray;

    describe('same signature tests', function () {

      beforeEach(async () => {
        mintAddressArray = [to, xcert.address, accounts[1]];
        mintUintArray = [id1, timestamp, expirationTimestamp, 1, 20];
        let hash = web3Util.soliditySha3(minter.address, to, xcert.address, id1, mockProof, uri,
          {t: 'bytes32[]', v:config}, {t: 'bytes32[]', v:data},
          {t: 'address[]', v:addressArray}, {t: 'uint256[]', v:amountArray}, timestamp, expirationTimestamp);
        let signature = web3.eth.sign(owner, hash);

        r = signature.substr(0, 66);
        s = '0x' + signature.substr(66, 64);
        v = parseInt('0x' + signature.substr(130, 2)) + 27;

        mintByteArray = [r, s, config[0], data[0]];
      });

      describe('cancel', function () {

        it('successfuly cancels mint', async () => {
          let { logs } = await minter.cancelMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, {from: owner});

          let cancelEvent = logs.find(e => e.event === 'CancelMint');
          assert.notEqual(cancelEvent, undefined);
        });

        it('throws when someone else then the minter tries to cancel it', async () => {
          await assertRevert(minter.cancelMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, {from: thirdParty}));
        });

        it('throws when trying to cancel an already performed mint', async () => {

          await token.approve(tokenProxy.address, 20, {from: to});
          await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});

          let { logs } = await minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: to});

          let event = logs.find(e => e.event === 'PerformMint');
          assert.notEqual(event, undefined);

          await assertRevert(minter.cancelMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, {from: owner}));
        });

      });

      describe('perform', function () {

        it('mints correctly', async () => {
          await token.approve(tokenProxy.address, 20, {from: to});
          await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});

          let { logs } = await minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: to});

          let event = logs.find(e => e.event === 'PerformMint');
          assert.notEqual(event, undefined);

          let tokenOwner = await xcert.ownerOf(id1);
          assert.equal(tokenOwner, to);

          let tokenAmountAcc1 = await token.balanceOf(accounts[1]);
          let tokenAmountAcc2 = await token.balanceOf(to);

          assert.equal(tokenAmountAcc1, 220);
          assert.equal(tokenAmountAcc2, 180);
        });

        it('throws if msg.sender is not the receiver', async () => {
          await token.approve(tokenProxy.address, 20, {from: to});
          await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});

          await assertRevert(minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: thirdParty}));
        });

        it('fails when trying to perform already performed mint', async () => {
          await token.approve(tokenProxy.address, 20, {from: to});
          await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});
          await minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: to});
          //TODO(Tadej): checks for revert message
          await assertRevert(minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: to}));
        });

        it('fails when approved token amount is not sufficient', async () => {
          await token.approve(tokenProxy.address, 10, {from: to});
          await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});
          //TODO(Tadej): checks for revert message
          await assertRevert(minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: to}));
        });

        it('throws when trying to perform canceled mint', async () => {
          await minter.cancelMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, {from: owner});
          await token.approve(tokenProxy.address, 20, {from: to});
          await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});
          //TODO(Tadej): checks for revert message
          await assertRevert(minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: to}));
        });

        it('throws when does not have mint rights', async () => {
          await token.approve(tokenProxy.address, 20, {from: to});
          //TODO(Tadej): checks for revert message
          await assertRevert(minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: to}));
        });

      });

    });

   describe('different signature tests', function () {

     it('mints correctly when no fees', async () => {
        mintAddressArray = [to, xcert.address];
        mintUintArray = [id1, timestamp, expirationTimestamp, 1];
        addressArray = [];
        amountArray = [];
        let hash = web3Util.soliditySha3(minter.address, to, xcert.address, id1, mockProof, uri,
          {t: 'bytes32[]', v:config}, {t: 'bytes32[]', v:data},
          {t: 'address[]', v:addressArray}, {t: 'uint256[]', v:amountArray}, timestamp, expirationTimestamp);
        let signature = web3.eth.sign(owner, hash);

        r = signature.substr(0, 66);
        s = '0x' + signature.substr(66, 64);
        v = parseInt('0x' + signature.substr(130, 2)) + 27;

        mintByteArray = [r, s, config[0], data[0]];

        await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});

        let { logs } = await minter.performMint(mintAddressArray, mintUintArray,mintByteArray,  mockProof, uri, v, {from: to});

        let event = logs.find(e => e.event === 'PerformMint');
        assert.notEqual(event, undefined);

        let tokenOwner = await xcert.ownerOf(id1);
        assert.equal(tokenOwner, to);
      });

      it('throws when fee amount array is no the same length then feeRecipient', async () => {

        mintAddressArray = [to, xcert.address];
        mintUintArray = [id1, timestamp, expirationTimestamp, 1, 20, 10];
        amountArray = [20, 10];
        let hash = web3Util.soliditySha3(minter.address, to, xcert.address, id1, mockProof, uri,
          {t: 'bytes32[]', v:config}, {t: 'bytes32[]', v:data},{t: 'address[]', v:addressArray},
          {t: 'uint256[]', v:amountArray}, timestamp, expirationTimestamp);
        let signature = web3.eth.sign(owner, hash);

        r = signature.substr(0, 66);
        s = '0x' + signature.substr(66, 64);
        v = parseInt('0x' + signature.substr(130, 2)) + 27;

        mintByteArray = [r, s, config[0], data[0]];

        await token.approve(tokenProxy.address, 20, {from: to});
        await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});

        await assertRevert(minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: to}));
      });

      it('throws when to and the owner addresses are the same', async () => {

        mintAddressArray = [owner, xcert.address];
        mintUintArray = [id1, timestamp, expirationTimestamp, 1, 20];
        amountArray = [20];

        let hash = web3Util.soliditySha3(minter.address, owner, xcert.address, id1, mockProof, uri,
          {t: 'bytes32[]', v:config}, {t: 'bytes32[]', v:data},{t: 'address[]', v:addressArray},
          {t: 'address[]', v:addressArray}, {t: 'uint256[]', v:amountArray}, timestamp, expirationTimestamp);
        let signature = web3.eth.sign(owner, hash);

        mintByteArray = [r, s, config[0], data[0]];

        r = signature.substr(0, 66);
        s = '0x' + signature.substr(66, 64);
        v = parseInt('0x' + signature.substr(130, 2)) + 27;

        await token.approve(tokenProxy.address, 20, {from: owner});
        await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});
        await assertRevert(minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: owner}));
      });

      it('throws if current time is after expirationTimestamp', async () => {
        mintAddressArray = [to, xcert.address];
        mintUintArray = [id1, timestamp, timestamp, 1, 20];
        amountArray = [20];

        let hash = web3Util.soliditySha3(minter.address, to, xcert.address, id1, mockProof, uri,
          {t: 'bytes32[]', v:config}, {t: 'bytes32[]', v:data},{t: 'address[]', v:addressArray},
          {t: 'address[]', v:addressArray}, {t: 'uint256[]', v:amountArray}, timestamp, timestamp);
        let signature = web3.eth.sign(owner, hash);

        mintByteArray = [r, s, config[0], data[0]];

        r = signature.substr(0, 66);
        s = '0x' + signature.substr(66, 64);
        v = parseInt('0x' + signature.substr(130, 2)) + 27;

        await token.approve(tokenProxy.address, 20, {from: to});
        await xcert.setAuthorizedAddress(mintProxy.address, true, {from: owner});
        await assertRevert(minter.performMint(mintAddressArray, mintUintArray, mintByteArray, mockProof, uri, v, {from: to}));
      });


   });

  });

});
