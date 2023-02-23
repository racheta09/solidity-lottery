const erc = artifacts.require("ERC");

module.exports = function (deployer) {
  deployer.deploy(erc);
};
