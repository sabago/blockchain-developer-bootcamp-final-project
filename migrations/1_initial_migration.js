const LandTitle = artifacts.require("LandTitle");

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts()
  const registryAccount = accounts[1]
  const landTitle = await deployer.deploy(LandTitle, registryAccount);

  console.log("registry address", registryAccount);
  console.log("Deployed land title address", landTitle.address);
};


