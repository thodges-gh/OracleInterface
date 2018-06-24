'use strict';

require('./support/helpers.js');

contract('MyContract', () => {
  let Link = artifacts.require("LinkToken.sol");
  let Oracle = artifacts.require("Oracle.sol");
  let MyContract = artifacts.require("MyContract.sol");
  let currency = 'USD';
  let link, oc, mc;

  beforeEach(async () => {
    link = await Link.new();
    oc = await Oracle.new(link.address, {from: oracleNode});
    mc = await MyContract.new(link.address, oc.address, {from: defaultAccount});
  });

  it("has a limited public interface", () => {
    checkPublicABI(MyContract, [
      "currentPrice",
      "receiveResult",
      "requestEthereumPrice"
    ]);
  });

  describe('#receiveResult', () => {
    let result = 1000000;
    let response = '0x' + encodeUint256(result);
    let internalId;

    beforeEach(async () => {
      await link.transfer(mc.address, web3.toWei('1', 'ether'));
      await mc.requestEthereumPrice(currency);
      let event = await getLatestEvent(oc);
      internalId = event.args.internalId;
    });

    it('records the data given to it by the oracle', async () => {
      await oc.fulfillData(internalId, response, {from: oracleNode});
      let currentPrice = await mc.currentPrice.call();
      assert.equal(currentPrice.toString(), result.toString());
    });

    it('does not allow the same id to be used twice', async () => {
      let newResult = 4000000;
      let newResponse = '0x' + encodeUint256(newResult);
      await oc.fulfillData(internalId, response, {from: oracleNode});
      let currentPrice = await mc.currentPrice.call();

      await assertActionThrows(async () => {
        await oc.fulfillData(internalId, newResponse, {from: oracleNode});
      })
      
      let newPrice = await mc.currentPrice.call();
      assert.equal(currentPrice.toString(), newPrice.toString());
    });

    context('when the consumer does not recognize the request ID', () => {
      let otherId;

      beforeEach(async () => {
        let funcSig = functionSelector('receiveResult(bytes32,bytes32)');
        let args = specAndRunBytes(mc.address, funcSig, 42, '');
        await requestDataFrom(oc, link, 0, args);
        let event = await getLatestEvent(oc);
        otherId = event.args.internalId;
      })

      it('does not accept the data provided', async () => {
        await oc.fulfillData(otherId, response, {from: oracleNode});

        let received = await mc.currentPrice.call();
        assert.equal(received.toString(), '0');
      });
    });

    context('when called by anyone other than the oracle contract', () => {
      it('does not accept the data provided', async () => {
        await assertActionThrows(async () => {
          await mc.receiveResult(internalId, response, {from: oracleNode});
        });

        let received = await mc.currentPrice.call();
        assert.equal(received.toString(), '0');
      });
    });
  });
});