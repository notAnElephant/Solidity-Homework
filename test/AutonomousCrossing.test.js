const AutonomousCrossing = artifacts.require("AutonomousCrossing");
const { assert } = require('chai');

// Import utilities from Test Helpers
const trassert = require('truffle-assertions');

// Idk mit csinal, nem merem kitorolni
/*module.exports = function(deployer) {
  deployer.deploy(AutonomousCrossing);
};*/



// Global enum constants
const cr_state_LOCKED = 0;
const cr_state_FREE = 1;
const cr_state_LOCK_REQUESTED = 2;

const lock_res_ANOTHER_LOCK_IS_ACTIVE = 0;
const lock_res_LOCK_SUCCESSFUL = 1;
const lock_res_LOCK_REQUESTED = 2;
const lock_res_HALT = 3;

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
  
    AC = await AutonomousCrossing.new();
    //AC = await AutonomousCrossing.deployed();

    // Registering accounts
    await AC.RegisterCar({from: car1});
    await AC.RegisterCar({from: car2});
    await AC.RegisterCar({from: car3});
    
    await AC.RegisterCrossing(crossing1, 3, 2, 3600, {from: admin});

    await AC.RegisterTrain(train1, {from: admin});
    await AC.RegisterTrain(train2, {from: admin});

  });

  describe("Testing truffle test environment", async () => {
    it("karigeri should be alkalmatlan.", async() => {
      assert.notEqual("Karigeri", "alkalmas");
    });
  });

  describe("Registrations", async () => {

    regtest_car = accounts[8];
    regtest_crossing = accounts[9];
    regtest_train = accounts[10];

    it("car registration", async () => {
      let finished_car = await AC.cars(regtest_car);
      assert.isFalse(finished_car.isSet);
      await AC.RegisterCar({from: regtest_car});
      finished_car = await AC.cars(regtest_car);
      assert.isDefined(finished_car.isSet);
      assert.isTrue(finished_car.isSet, "the car should be set");
      assert.equal(finished_car.id, regtest_car, "the set address should be the same as the car's address");
      assert.equal(finished_car.passValidity, 0);
    });

    it("crossing registration", async () => {
      let finished_crossing = await AC.crossings(regtest_crossing);
      assert.isFalse(finished_crossing.isSet);
      await AC.RegisterCrossing(regtest_crossing, 3, 2, 3600, {from: admin});
      finished_crossing = await AC.crossings(regtest_crossing);
      assert.isTrue(finished_crossing.isSet, "the crossing should be set");
      assert.equal(finished_crossing.state, cr_state_FREE, "the crossing should be free");
      assert.equal(finished_crossing.id, regtest_crossing);
      assert.equal(finished_crossing.train_lock, 0);
    });

    it("train registration", async () => {
      let finished_train = await AC.trains(regtest_train);
      assert.isFalse(finished_train.isSet);
      await AC.RegisterTrain(regtest_train, {from: admin});
      finished_train = await AC.trains(regtest_train);
      assert.isDefined(finished_train.isSet);
      assert.isTrue(finished_train.isSet, "the train should be set");
      assert.equal(finished_train.id, regtest_train, "the set address should  be the same as the train's address");
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

  describe("Combined tests", async () => {
    it("Pass request", async () => {

      await AC.LockCrossing(crossing1, {from: train1});
      let finished_crossing = await AC.crossings(crossing1);
      assert.equal(finished_crossing.state, cr_state_LOCKED, "Crossing should be locked");

      await AC.ReleaseLock(crossing1, {from: train1});

      assert.equal(finished_crossing.state, cr_state_FREE, "Crossing should be free");

    });

    it("Multiple cars", async () => {});
    it("Multiple trains", async () => {});
    it("Lock requested", async () => {});
    it("Expired crossing permission", async () => {});
    it("Ticket", async () => {});

  });

  
  describe("Other tests", async () => {

    it("Crossing free", async () => {});
    it("Authority test", async () => {});

  });
  
});