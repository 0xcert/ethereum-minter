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

    await token.methods
      .transfer(accounts[1], 200)
      .send({
        from: accounts[0]
      });

    await token.methods
      .transfer(accounts[2], 200)
      .send({
        from: accounts[0]
      });

    await token.methods
      .transfer(accounts[3], 200)
      .send({
        from: accounts[0]
      });

    minter = await artifact.deploy({
      src: 'Minter.json', 
      args: [tokenProxy._address, mintProxy._address] 
    });

    xcert = await artifact.deploy({ 
      src: 'XcertMock.json',
      args: ['Foo', 'F', '0xa65de9e6']
    });

    await tokenProxy.methods
      .addAuthorizedAddress(minter._address)
      .send({
        from: accounts[0]
      });

    await mintProxy.methods
      .addAuthorizedAddress(minter._address)
      .send({
        from: accounts[0]
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

  /*
  TODO(Tadej): Find a way to locally hash array of structs.
  describe('hashing', function () {
    let testArrayAccount;
    let testArrayAmount;

    let timestamp;
    let expirationTimestamp ;

    let claimUintArray;
    let claimBytesArray;

    let contractHash;

    beforeEach(async function () {
      testArrayAccount = [accounts[3], accounts[5]];
      testArrayAmount = [1, 10];

      timestamp = 1521195657;
      expirationTimestamp = 1821195657;

      claimUintArray = [id1, timestamp, expirationTimestamp, 1, 1, 10];
      claimBytesArray = ["0x1", "0x3", config[0], data[0]];

      const xcertData = {
        xcert: xcert._address,
        id: id1,
        proof: mockProof,
        uri: uri,
        config: config,
        data: data,
      }

      const mintData = {
        to: accounts[1],
        fees: [
          {
            feeAddress: accounts[3],
            feeAmount: 1,
            tokenAddress: token._address,
          },
          {
            feeAddress: accounts[5],
            feeAmount: 10,
            tokenAddress: token._address,
          }
        ],
        seed: timestamp,
        expirationTimestamp: expirationTimestamp,
      }

      contractHash = await minter.methods
        .getMintDataClaim(toTuple(mintData), toTuple(xcertData))
        .call({
          from: accounts[0]
        });
    });

    it('compares the same local and contract hash', async function () {

      const test = {
        amount: 50,
        data: [
          {
            address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
            value: 50
          },
          {
            address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
            value: 50
          },
          {
            address: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
            value: 50
          }
        ]
      }

      console.log(toTuple(test));
      console.log(toTuple(test).join(','));


      console.log(contractHash);
      const fees = {
        fees: [
          {
            feeAddress: accounts[3],
            feeAmount: 1,
            tokenAddress: token._address,
          },
          {
            feeAddress: accounts[5],
            feeAmount: 10,
            tokenAddress: token._address,
          }
        ]
      }

      let localHash = web3.utils.soliditySha3(minter._address, accounts[1], xcert._address, id1, mockProof, uri,
        {t: 'bytes32[]', v:config}, {t: 'bytes32[]', v:data},
        toTuple(fees).join(","), timestamp, expirationTimestamp);
      assert.equal(contractHash, localHash);
    });

    it('compares different local and contract hash', async function () {
       let localHash = web3.utils.soliditySha3(minter._address, accounts[1], xcert._address, id1, mockProof, uri,
        {t: 'bytes32[]', v:config}, {t: 'bytes32[]', v:data},
        {t: 'address[]', v:testArrayAccount}, {t: 'uint256[]', v:testArrayAmount}, timestamp, 34);
      assert.notEqual(contractHash, localHash);
    });
  });*/

  describe('signature', function () {
    let hash;
    let rsv;

    let timestamp = 1521195657;
    let expirationTimestamp = 1821195657;

    beforeEach(async function () {

      const xcertData = {
        xcert: xcert._address,
        id: id1,
        proof: mockProof,
        uri: uri,
        config: config,
        data: data,
      }

      const mintData = {
        to: accounts[1],
        fees: [
          {
            feeAddress: accounts[3],
            feeAmount: 1,
            tokenAddress: token._address,
          },
          {
            feeAddress: accounts[5],
            feeAmount: 10,
            tokenAddress: token._address,
          }
        ],
        seed: timestamp,
        expirationTimestamp: expirationTimestamp,
      }

      hash = await minter.methods
        .getMintDataClaim(toTuple(mintData), toTuple(xcertData))
        .call({
          from: accounts[0]
        });
         
      let signature = await web3.eth.sign(hash, accounts[0]);

      rsv = {
        r: signature.substr(0, 66),
        s: '0x' + signature.substr(66, 64),
        v: parseInt('0x' + signature.substr(130, 2)) + 27,
      }
    });

    it('correctly validates correct signer', async function () {
      const valid = await minter.methods
        .isValidSignature(accounts[0], hash, toTuple(rsv))
        .call({
          from: accounts[0]
        });
      assert.equal(valid, true);
    });

    it('correctly validates wrong signer', async function () {
      const valid = await minter.methods
        .isValidSignature(accounts[1], hash, toTuple(rsv))
        .call({
          from: accounts[0]
        });
      assert.equal(valid, false);
    });

    it('correctly validates wrong signature data', async function () {
      rsv.r = '0x4e7cbaf43f2c2df6aa359bdaf2bd845f8b4570ae36981beb5c09880244c31816';
      const valid = await minter.methods
        .isValidSignature(accounts[0], hash, toTuple(rsv))
        .call({
          from: accounts[0]
        });
      assert.equal(valid, false);
    });
  });

  describe('mint', function () {

    let rsv;
    let timestamp = 1521195657;
    let expirationTimestamp = 1821195657;
    let owner;
    let to;
    let thirdParty;
    let xcertData;
    let mintData;

    beforeEach(async function () {
      owner = accounts[0];
      to = accounts[2];
      thirdParty = accounts[3];

      xcertData = {
        xcert: xcert._address,
        id: id1,
        proof: mockProof,
        uri: uri,
        config: config,
        data: data,
      }

      mintData = {
        to: to,
        fees: [
          {
            feeAddress: accounts[1],
            feeAmount: 20,
            tokenAddress: token._address,
          },
        ],
        seed: timestamp,
        expirationTimestamp: expirationTimestamp,
      }
    });

    describe('same signature tests', function () {

      beforeEach(async function () {

        const hash = await minter.methods
          .getMintDataClaim(toTuple(mintData), toTuple(xcertData))
          .call({
            from: owner
          });
           
        const signature = await web3.eth.sign(hash, owner);
  
        rsv = {
          r: signature.substr(0, 66),
          s: '0x' + signature.substr(66, 64),
          v: parseInt('0x' + signature.substr(130, 2)) + 27,
        }
      });

      describe('cancel', function () {
        it('successfuly cancels mint', async function () {
          const logs = await minter.methods
            .cancelMint(toTuple(mintData), toTuple(xcertData))
            .send({
              from: owner
            });
          assert.notEqual(logs.events.CancelMint, undefined);
        });

        it('throws when someone else then the minter tries to cancel it', async function () {
          await assertRevert(
            minter.methods
            .cancelMint(toTuple(mintData), toTuple(xcertData))
            .send({
              from: thirdParty
            })
          );
        });

        it('throws when trying to cancel an already performed mint', async function () {

          await token.methods
            .approve(tokenProxy._address, 20)
            .send({
              from: to
            });

          await xcert.methods
            .setAuthorizedAddress(mintProxy._address, true)
            .send({
              from: owner
            });

          await minter.methods
            .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
            .send({
              from: to,
              gas: 2000000
            });

          await assertRevert(
            minter.methods
            .cancelMint(toTuple(mintData), toTuple(xcertData))
            .send({
              from: owner
            })
          );
        });
      });

      describe('perform', function () {

        it('mints correctly', async function () {
          await token.methods
            .approve(tokenProxy._address, 20)
            .send({
              from: to,
            });

          await xcert.methods
            .setAuthorizedAddress(mintProxy._address, true)
            .send({
              from: owner,
            });

          const logs = await minter.methods
            .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
            .send({
              from: to,
              gas: 2000000,
            });

          assert.notEqual(logs.events.PerformMint, undefined);

          const tokenOwner = await xcert.methods
            .ownerOf(id1)
            .call({
              from: owner,
            });

          assert.equal(tokenOwner, to);

          const tokenAmountAcc1 = await token.methods
            .balanceOf(accounts[1])
            .call({
              from: owner,
            });

          const tokenAmountAcc2 = await token.methods
            .balanceOf(to)
            .call({
              from: owner,
            });

          assert.equal(tokenAmountAcc1, 220);
          assert.equal(tokenAmountAcc2, 180);
        });

        it('throws if msg.sender is not the receiver', async function () {
          await token.methods
            .approve(tokenProxy._address, 20)
            .send({
              from: to,
            });

          await xcert.methods
            .setAuthorizedAddress(mintProxy._address, true)
            .send({
              from: owner,
            });

          await assertRevert( 
            minter.methods
            .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
            .send({
              from: thirdParty,
              gas: 2000000,
            })
          );
        });

        it('fails when trying to perform already performed mint', async function () {
          await token.methods
            .approve(tokenProxy._address, 20)
            .send({
              from: to,
            });

          await xcert.methods
            .setAuthorizedAddress(mintProxy._address, true)
            .send({
              from: owner,
            });

          await minter.methods
            .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
            .send({
              from: to,
              gas: 2000000,
            });
        
          await assertRevert( 
            minter.methods
            .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
            .send({
              from: to,
              gas: 2000000,
            })
          );
        });

        it('fails when approved token amount is not sufficient', async function () {
          await token.methods
            .approve(tokenProxy._address, 10)
            .send({
              from: to,
            });

          await xcert.methods
            .setAuthorizedAddress(mintProxy._address, true)
            .send({
              from: owner,
            });

          await assertRevert( 
            minter.methods
            .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
            .send({
              from: to,
              gas: 2000000,
            })
          );
        });

        it('throws when trying to perform canceled mint', async function () {
          await token.methods
            .approve(tokenProxy._address, 20)
            .send({
              from: to,
            });

          await xcert.methods
            .setAuthorizedAddress(mintProxy._address, true)
            .send({
              from: owner,
            });

          await minter.methods
            .cancelMint(toTuple(mintData), toTuple(xcertData))
            .send({
              from: owner,
              gas: 2000000,
            });
        
          await assertRevert( 
            minter.methods
            .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
            .send({
              from: to,
              gas: 2000000,
            })
          );
        });

        it('throws when does not have mint rights', async function () {
          await token.methods
            .approve(tokenProxy._address, 20)
            .send({
              from: to,
            });

          await assertRevert( 
            minter.methods
            .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
            .send({
              from: to,
              gas: 2000000,
            })
          );
        });
      });
    });

    describe('different signature tests', function () {
      it('mints correctly when no fees', async function () {
        mintData.fees = [];

        const hash = await minter.methods
          .getMintDataClaim(toTuple(mintData), toTuple(xcertData))
          .call({
            from: owner
          });
         
        const signature = await web3.eth.sign(hash, owner);

        rsv = {
          r: signature.substr(0, 66),
          s: '0x' + signature.substr(66, 64),
          v: parseInt('0x' + signature.substr(130, 2)) + 27,
        }
        
        await xcert.methods
          .setAuthorizedAddress(mintProxy._address, true)
          .send({
            from: owner,
          });

        const logs = await minter.methods
          .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
          .send({
            from: to,
            gas: 2000000,
          });

        assert.notEqual(logs.events.PerformMint, undefined);

        const tokenOwner = await xcert.methods
          .ownerOf(id1)
          .call({
            from: owner,
          });

        assert.equal(tokenOwner, to);
      });

      it('throws when fees not correctly configured', async function () {
        mintData.fees = [{
            feeAddress: accounts[1],
            feeAmount: -1,
            tokenAddress: token._address,
          }];

        const hash = await minter.methods
          .getMintDataClaim(toTuple(mintData), toTuple(xcertData))
          .call({
            from: owner
          });
         
        const signature = await web3.eth.sign(hash, owner);

        rsv = {
          r: signature.substr(0, 66),
          s: '0x' + signature.substr(66, 64),
          v: parseInt('0x' + signature.substr(130, 2)) + 27,
        }

        await token.methods
          .approve(tokenProxy._address, 20)
          .send({
            from: owner,
          });
        
        await xcert.methods
          .setAuthorizedAddress(mintProxy._address, true)
          .send({
            from: owner,
          });

        await assertRevert( 
          minter.methods
          .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
          .send({
            from: owner,
            gas: 2000000,
          })
        );
      });

      it('throws when to and the owner addresses are the same', async function () {
        mintData.to = owner;

        const hash = await minter.methods
          .getMintDataClaim(toTuple(mintData), toTuple(xcertData))
          .call({
            from: owner
          });
        
        const signature = await web3.eth.sign(hash, owner);

        rsv = {
          r: signature.substr(0, 66),
          s: '0x' + signature.substr(66, 64),
          v: parseInt('0x' + signature.substr(130, 2)) + 27,
        }
        
        await xcert.methods
          .setAuthorizedAddress(mintProxy._address, true)
          .send({
            from: owner,
          });

        await assertRevert( 
          minter.methods
          .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
          .send({
            from: to,
            gas: 2000000,
          })
        );
      });

      it('throws if current time is after expirationTimestamp', async function () {
        mintData.expirationTimestamp = timestamp;

        const hash = await minter.methods
          .getMintDataClaim(toTuple(mintData), toTuple(xcertData))
          .call({
            from: owner
          });
        
        const signature = await web3.eth.sign(hash, owner);

        rsv = {
          r: signature.substr(0, 66),
          s: '0x' + signature.substr(66, 64),
          v: parseInt('0x' + signature.substr(130, 2)) + 27,
        }

        await token.methods
          .approve(tokenProxy._address, 20)
          .send({
            from: to,
          });
        
        await xcert.methods
          .setAuthorizedAddress(mintProxy._address, true)
          .send({
            from: owner,
          });

        await assertRevert( 
          minter.methods
          .performMint(toTuple(mintData), toTuple(xcertData), toTuple(rsv))
          .send({
            from: to,
            gas: 2000000,
          })
        );
      });
    });
  });
});
