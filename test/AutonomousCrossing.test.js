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

      let debug_car = await AC.cars(car1);

      assert.isFalse(debug_car.isSet);

      AC.RegisterCar({from: car1});

      debug_car = await AC.cars(car1);

      assert.isDefined(debug_car.isSet);
      assert.isTrue(debug_car.isSet);

    });

    it("registered crossing", async () => {
      assert.isUndefined(AC.crossings[crossing]);
      AC.RegisterCrossing(crossing, 3, 2, 3600, {from: admin});
    });

    it("registered train", async () => {
      assert.isUndefined(AC.trains[train1]);
      AC.RegisterTrain(train1, {from: admin});
    });

  });

  describe("Permission tests", async () => {
    it("car permissions", async () => {
    });

  });

  describe("Car mechanics", async () => {
    it("car mech 1", async () => {
    });

  });

  describe("Train mechanics", async () => {
    it("train mech 1", async () => {
    });
  });

  describe("Combined tests", async () => {
    it("combined 1", async () => {
    });
  });
  
});