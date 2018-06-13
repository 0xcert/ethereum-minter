import { assert, artifact, web3 } from '@chainspin/test';
import { toTuple } from '@chainspin/utils';

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
  
  beforeEach(async () => {
    tokenProxy = await artifact.deploy({ src: 'TokenTransferProxy.json' });
    mintProxy = await artifact.deploy({ src: 'XcertMintProxy.json' });
    token = await artifact.deploy({ src: 'TokenMock.json' });

    minter = await artifact.deploy({
      src: 'Minter.json', 
      args: [tokenProxy._address, mintProxy._address] 
    });

    xcert = await artifact.deploy({ 
      src: 'XcertMock.json',
      args: ['Foo', 'F', '0xa65de9e6']
    });

    accounts = await web3.eth.getAccounts();
  });

  describe('contract addresses', function () {

    it('check if token transfer proxy address is correct', async () => {
      let address = await minter.methods.getTokenTransferProxyAddress().call({ from: accounts[0] });
      assert.equal(address, tokenProxy._address);
    });

    it('check if xcert mint proxy address is correct', async () => {
      let address = await minter.methods.getXcertMintProxyAddress().call({ from: accounts[0] });
      assert.equal(address, mintProxy._address);
    });
  });


});
