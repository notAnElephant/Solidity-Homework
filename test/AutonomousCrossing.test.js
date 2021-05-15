const AutonomousCrossing = artifacts.require("AutonomousCrossing");
const { assert } = require('chai');

// Import utilities from Test Helpers
const trassert = require('truffle-assertions');


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


contract("AutonomousCrossing", async /*ez nem volt async*/ (accounts) => {

  //const AC = await AutonomousCrossing.deployed();
  let AC;

  let admin = accounts[0];
  let car1 = accounts[1];
  let car2 = accounts[2];
  let car3 = accounts[3];
  let crossing1 = accounts[4];
  let train1 = accounts[5];
  let train2 = accounts[6];
  let non_admin = accounts[7];

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
      let finished_car = await AC.cars(car1);
      assert.isFalse(finished_car.isSet);
      AC.RegisterCar({from: car1});
      finished_car = await AC.cars(car1);
      assert.isDefined(finished_car.isSet);
      assert.isTrue(finished_car.isSet, "the car should be set");
      assert.equal(finished_car.id, car1, "the set address should be the same as the car's address");
      assert.equal(finished_car.passValidity, 0);
    });

    it("registered crossing", async () => {
      let finished_crossing = await AC.crossings(crossing1);
      assert.isFalse(finished_crossing.isSet);
      AC.RegisterCrossing(crossing1, 3, 2, 3600, {from: admin});
      finished_crossing = await AC.crossings(crossing1);
      assert.isTrue(finished_crossing.isSet, "the crossing should be set");
      assert.equal(finished_crossing.state, 1 /* enum state FREE*/, "the crossing should be free");
      assert.equal(finished_crossing.id, crossing1);
      assert.equal(finished_crossing.train_lock, 0);
    });

    it("registered train", async () => {
      let finished_train = await AC.trains(train1);
      assert.isFalse(finished_train.isSet);
      AC.RegisterTrain(train1, {from: admin});
      finished_train = await AC.trains(train1);
      assert.isDefined(finished_train.isSet);
      assert.isTrue(finished_train.isSet, "the train should be set");
      assert.equal(finished_train.id, train1, "the set address should  be the same as the train's address");
    });

  });

  describe("Permission tests", async () => {
    
    it("car permissions", async () => {

      await trassert.reverts(AC.LockCrossing(crossing1, {from: car1}));
      await trassert.reverts(AC.ReleaseLock(crossing1, {from: car1}));

    });
    it("train permissions", async () => {
      // attempting to register a train without admin permissions  
      trassert.reverts(AC.RegisterTrain(train1, {from: non_admin}));
    });

    it("crossing permissions", async() => {      
      // attempting to register a crossing without admin permissions
      trassert.reverts(AC.RegisterCrossing(crossing1, 3, 2, 3600, {from: non_admin}));
      
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