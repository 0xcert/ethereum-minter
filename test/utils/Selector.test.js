const Minter = artifacts.require('Minter');
const Selector = artifacts.require('Selector');

contract('Selector', (accounts) => {

  let selector;

  beforeEach(async function () {
    selector = await Selector.new();
  });

  it('Checks Minter selector', async () => {
    var minter = await Minter.new(accounts[1], accounts[2], accounts[3]);
    var bytes = await selector.calculateMinterSelector();
    var supports = await minter.supportsInterface(bytes);
    assert.equal(supports, true);
  });

});
