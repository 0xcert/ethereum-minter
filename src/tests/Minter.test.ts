import { assert, artifact, web3 } from '@chainspin/test';

describe('Minter', async () => {
  
  beforeEach(async () => {
    this.tokenProxy = await artifact.deploy({ src: 'TokenTransferProxy.json' });
    this.mintProxy = await artifact.deploy({ src: 'XcertMintProxy.json' });
    this.token = await artifact.deploy({ src: 'TokenMock.json' });
    this.minter = await artifact.deploy({
      src: 'Minter.json', 
      args: [this.token._address, this.tokenProxy._address, this.mintProxy._address] 
    });
    this.accounts = await web3.eth.getAccounts();
  });

  describe('contract addresses', async () => {
    it('check if token address is correct', async () => {
      let address = await this.minter.methods.getTokenAddress().call({ from: this.accounts[0] });
      assert.equal(address, this.token._address);
    });

    it('check if token transfer proxy address is correct', async () => {
      let address = await this.minter.methods.getTokenTransferProxyAddress().call({ from: this.accounts[0] });
      assert.equal(address, this.tokenProxy._address);
    });

    it('check if xcert mint proxy address is correct', async () => {
      let address = await this.minter.methods.getXcertMintProxyAddress().call({ from: this.accounts[0] });
      assert.equal(address, this.mintProxy._address);
    });
  });

  it('Does nothing - test', async () => {
    //await this.minter.methods.performMint().send({ from: this.accounts[0] });
  });
});
