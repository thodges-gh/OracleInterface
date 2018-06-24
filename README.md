# Example Chainlink Contract for [EIP 1154 - Oracle Interface](https://github.com/ethereum/EIPs/issues/1161)

This contract makes use of [Chainlink](https://github.com/smartcontractkit/chainlink) in order to fulfill requests for external data.

Install

```bash
$ npm install
```

Run Ganache (or any chain running on port 8545)

```bash
$ ./node_modules/.bin/ganache-cli --deterministic
```

Migrate

```bash
$ truffle migrate --reset --network development
```

Test

```bash
$ truffle test --network development
```

Remix-friendly contract available in the `remix/` directory, organized by network. Simply import or copy/paste into the [Remix](http://remix.ethereum.org) interface. 

Chainlink contracts require LINK to request external data. Visit our [faucet](https://developers.smartcontract.com/faucet) to obtain Ropsten LINK tokens.