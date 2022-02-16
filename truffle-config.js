
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    }
  },
  plugins: ["solidity-coverage"],
  compilers: {
    solc: {
      settings: {
        evmVersion: "istanbul",
        optimizer: { enabled: true, runs: 9999999 },
      },
      version: "^0.6.0",
      docker: false,
      parser: "solcjs",
    }
  }
};
