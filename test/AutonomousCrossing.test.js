const AutonomousCrossing = artifacts.require("AutonomousCrossing");
const { assert } = require('chai');

/*module.exports = function(deployer) {
  deployer.deploy(AutonomousCrossing);
};*/

/*
package.json

Openzeppelin NPM-ről (testhelper, 
Chai - assert

const { assert } = require('chai')

describe blokkosítja a teszteket

Függvényekben +1 paraméter
{from: accounts[n]}


*/


//contract->describe->it
//

// Lol lehetne payable módon adni ticketet a kocsiknak
//const result 7 await [...]
//const returnargument = result.logs[0].args.argumentwhatever;

contract("AutonomousCrossing", (accounts) => {

  let AC;

  let admin = accounts[0];
  let car1 = accounts[1];
  let car2 = accounts[2];
  let car3 = accounts[3];
  let crossing = accounts[4];
  let train1 = accounts[5];
  let train2 = accounts[6];

  beforeEach(async () => {

    AutonomousCrossing.new();
    AC = await AutonomousCrossing.deployed();

  });

  describe("Testing truffle test environment", async () => {
    it("karigeri should be alkalmatlan.", async() => {
      assert.notEqual("Karigeri", "alkalmas");
    });
  });

  describe("Registrations", async () => {

    it("registered car", async () => {
      assert.isFalse(AC.cars[car1].isSet);
      AC.RegisterCar({from: car1});
      assert.isTrue(AC.cars[car1].isSet);
    });

  });

});