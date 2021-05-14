const AutonomousCrossing = artifacts.require("AutonomousCrossing");

module.exports = function(deployer) {
  deployer.deploy(AutonomousCrossing);
};