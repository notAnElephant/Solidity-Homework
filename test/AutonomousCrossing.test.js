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

      assert.isUndefined(AC.cars[car1]);

      AC.RegisterCar({from: car1});

      console.log("VALUE OF AC.cars:");
      console.log(AC.cars);

      assert.isDefined(AC.cars[car1]); // Elvileg definiálva kéne, hogy legyen.
      assert.isDefined(AC.cars[car1].isSet); // Ez a két sor meg már
      assert.isTrue(AC.cars[car1].isSet);    // nyilván nem fog menni

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