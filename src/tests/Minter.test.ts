import { assert, artifact, web3 } from '@chainspin/test';

describe('Minter', async () => {

  beforeEach(async () => {
    this.minter = await artifact.deploy({ src: 'Minter.json' });
    this.accounts = await web3.eth.getAccounts();
  });

  it('Does nothing - test', async () => {
    //await this.minter.methods.performMint().send({ from: this.accounts[0] });
  });
});
