pragma solidity ^0.4.24;

contract OracleHandler {
  function receiveResult(bytes32 id, bytes32 result) external;
}
