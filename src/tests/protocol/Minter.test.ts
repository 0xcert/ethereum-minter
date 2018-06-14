import { assert, artifact, web3 } from '@chainspin/test';
import { toTuple } from '@chainspin/utils';
import assertRevert from '../helpers/assertRevert';


describe('Minter', function () {
  let minter;
  let tokenProxy;
  let mintProxy;
  let token;
  let accounts;
  let xcert;
  const id1 = web3.utils.sha3('test1');
  const id2 = web3.utils.sha3('test2');
  const id3 = web3.utils.sha3('test3');
  const uri = "www.test.com";
  const mockProof = '1e205550c271490347e5e2393a02e94d284bbe9903f023ba098355b8d75974c8';
  const config = [web3.utils.padLeft(web3.utils.numberToHex(1821195657), 64)];
  const data = [web3.utils.padLeft(web3.utils.numberToHex(3), 64)];

  before(async function () {
    accounts = await web3.eth.getAccounts();
  });
  
  beforeEach(async function () {
    tokenProxy = await artifact.deploy({ 
      src: 'TokenTransferProxy.json' 
    });
    mintProxy = await artifact.deploy({ 
      src: 'XcertMintProxy.json' 
    });
    token = await artifact.deploy({ 
      src: 'TokenMock.json' 
    });

    minter = await artifact.deploy({
      src: 'Minter.json', 
      args: [tokenProxy._address, mintProxy._address] 
    });

    xcert = await artifact.deploy({ 
      src: 'XcertMock.json',
      args: ['Foo', 'F', '0xa65de9e6']
    });
  });

  describe('constuctor()', function () {
    it('sets token transfer address', async function () {
      const address = await minter.methods
        .getTokenTransferProxyAddress()
        .call({ 
          from: accounts[0],
        });
      assert.equal(address, tokenProxy._address);
    });

    it('sets mint proxy address', async function () {
      const address = await minter.methods
        .getXcertMintProxyAddress()
        .call({ 
          from: accounts[0],
        });
      assert.equal(address, mintProxy._address);
    });
  });

  describe('hashing', function () {
    beforeEach(async function () {
    });

    it('compares the same local and contract hash', async function () {
    });

    it('compares different local and contract hash', async function () {
    });
  });


  describe('signature', function () {
    beforeEach(async function () {
    });

    it('correctly validates correct signer', async function () {
    });

    it('correctly validates wrong signer', async function () {
    });

    it('correctly validates wrong signature data', async function () {
    });

    it('correctly validates signature data from another account', async function () {
    });
  });

  describe('mint', function () {

    describe('same signature tests', function () {

      beforeEach(async function () {
      });

      describe('cancel', function () {
        it('successfuly cancels mint', async function () {
        });

        it('throws when someone else then the minter tries to cancel it', async function () {
        });

        it('throws when trying to cancel an already performed mint', async function () {
        });
      });

      describe('perform', function () {
        it('mints correctly', async function () {
        });

        it('throws if msg.sender is not the receiver', async function () {
        });

        it('fails when trying to perform already performed mint', async function () {
        });

        it('fails when approved token amount is not sufficient', async function () {
        });

        it('throws when trying to perform canceled mint', async function () {
        });

        it('throws when does not have mint rights', async function () {
        });
      });
    });

    describe('different signature tests', function () {
      it('mints correctly when no fees', async function () {
      });

      it('throws when fee amount array is no the same length then feeRecipient', async function () {
      });

      it('throws when to and the owner addresses are the same', async function () {
      });

      it('throws if current time is after expirationTimestamp', async function () {
      });
    });
  });
});
