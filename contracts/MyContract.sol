pragma solidity ^0.4.24;

import "./OracleHandler.sol";
import "chainlink/solidity/contracts/Chainlinked.sol";

contract MyContract is Chainlinked, OracleHandler {

  uint256 public currentPrice;

  event RequestFulfilled(
    bytes32 indexed id,
    bytes32 indexed result
  );

  constructor(address _link, address _oracle) public {
    setLinkToken(_link);
    setOracle(_oracle);
  }


  function requestEthereumPrice(string _currency) public {
    string[] memory tasks = new string[](5);
    tasks[0] = "httpget";
    tasks[1] = "jsonparse";
    tasks[2] = "multiply";
    tasks[3] = "ethuint256"; // Data can be formatted off-chain...
    tasks[4] = "ethtx";

    ChainlinkLib.Spec memory spec = newSpec(tasks, this, "receiveResult(bytes32,bytes32)");
    spec.add("url", "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR,JPY");
    string[] memory path = new string[](1);
    path[0] = _currency;
    spec.addStringArray("path", path);
    spec.addInt("times", 100);
    chainlinkRequest(spec, LINK(1));
  }

  /**
  * @dev Data fulfilled from an oracle
  * @param id The request id supplied by the oracle when the request was created
  * @param result The payload of the requested data
  */
  function receiveResult(bytes32 id, bytes32 result)
    // Reverts if msg.sender is not oracle, unrecognized id, same id, cannot handle result
    checkChainlinkFulfillment(id)
    external
  {
    emit RequestFulfilled(id, result);
    currentPrice = uint256(result); // ...so that type casting doesn't need to take place on-chain.
  }

}
