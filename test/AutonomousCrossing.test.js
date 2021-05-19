/*

  TODO

  - schedule megoldása
  - dokumentáció
  - utolsó tesztek megírása
  - többi TODO megoldása
  - időpontfoglalás bemutatásra
  - éjfél a határidő rip
  - konzultáció kérése Kleiniktől

*/

const AutonomousCrossing = artifacts.require("AutonomousCrossing");
const { assert } = require('chai');

// Import utilities from Test Helpers
const trassert = require('truffle-assertions');

//const bignum = require('../lib/bignumber.js');


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

    // Checking accounts
    assert.isTrue(await AC.IsCar(car1));
    assert.isTrue(await AC.IsCar(car2));
    assert.isTrue(await AC.IsCar(car3));
    
    assert.isTrue(await AC.IsCrossing(crossing1));
    
    assert.isTrue(await AC.IsTrain(train1));
    assert.isTrue(await AC.IsTrain(train2));

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
      assert.equal(finished_car.passValidity, 0, "");
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
   it("Pass request (free)", async () => {

      let finished_car = await AC.cars(car1);
      assert.isFalse(await AC.IsPassValid({from: car1}), "Pass is valid before request is made");
      assert.equal(finished_car.passValidity, 0, "Pass is valid before request is made");

      await AC.RequestPass(crossing1, 0, {from: car1});
      finished_car = await AC.cars(car1);

      assert.notEqual(finished_car.passValidity, 0, "Incorrect pass validity");

      assert.isTrue(await AC.IsPassValid({from: car1}));
      await AC.ReleasePass({from: car1});
      assert.isFalse(await AC.IsPassValid({from: car1}));
      
    });

    it("Pass request 2 (locked)", async() => {

      await AC.LockCrossing(crossing1, {from: train1});
      let finished_crossing = await AC.crossings(crossing1);
      assert.equal(finished_crossing.state, cr_state_LOCKED, "Crossing should be locked");

      await AC.ReleaseLock(crossing1, {from: train1});

      finished_crossing = await AC.crossings(crossing1);
      assert.equal(finished_crossing.state, cr_state_FREE, "Crossing should be free");

    });

    it("Multiple pass requests", async () => {

      await AC.RequestPass(crossing1, 0, {from: car1});
      trassert.reverts(AC.RequestPass(crossing1, 0, {from: car1}));

    });

    it("Multiple cars", async () => {

      // Two cars are taking up all the space in the crossing (line 0's limit)
      await AC.RequestPass(crossing1, 0, {from: car1});
      await AC.RequestPass(crossing1, 0, {from: car2});

      // The third car should not be allowed to get a pass
      trassert.reverts(AC.RequestPass(crossing1, 0, {from: car3}));

      let finished_car = await AC.cars[car3];
      assert.isFalse(await AC.IsPassValid({from: car3}));

      // The first car exits the crossing, thus opening up space for the third one
      await AC.ReleasePass({from: car1});

      await AC.RequestPass(crossing1, 0, {from: car3});
      assert.isTrue(await AC.IsPassValid({from: car3}));

    });

    /* TODO fix: solidity return type -> int

    Olivér hozzátette: "Tudjunk már egy kibaszott számot visszaadni"
    Ágoston: *felírja*
    Olivér: "Most ezt felírod?"
    Ágoston: "De most komolyan..."
*/
    it("Multiple trains", async () => {

      await AC.LockCrossing(crossing1, {from: train1});
      
      let finished_lstate = await web3.utils.toBN(await AC.LockCrossing(crossing1, {from: train2}));
      
      console.log("Pacal 1 " + finished_lstate);

      assert.equal(finished_lstate, await web3.utils.toBN(lock_res_ANOTHER_LOCK_IS_ACTIVE),
      "The second train should get an 'another lock is active' response");
    });

    it("Lock requested", async () => {
      await AC.RequestPass(crossing1, 0, {from: car1});
      let result = await AC.RequestLock(crossing1, {from: train1});

      //assert.equal(lock_res_LOCK_REQUESTED, result);
    });

    it("Halt", async () => {  
      //ha túl sokáig nem jó a lock, a vonatnak meg kell állnia

      await AC.RequestPass(crossing1, 0, {from: car1});
      await AC.RequestLock(crossing1, {from: train1});

      let train = await AC.trains(train1);
      train.lock_request_time -= 86400;  

    });
    
    it("Ticket", async () => {
      await AC.RequestPass(crossing1, 0, {from: car1});
      //the system calls the function below after t amount of time has passed
      await AC.CheckIfPassIsReleased({from: car1});
      assert.notEqual(0, await AC.tickets(car1), "the car should have at leas 1 ticket");
    });

  });
  
  describe("Other tests", async () => {

    it("Crossing free", async () => {
      
      let finished_crossing = await AC.crossings(crossing1);

      assert.equal(finished_crossing.state, cr_state_FREE);
      assert.equal(await AC.IsCrossingFree(crossing1), true, {from: admin});
      assert.equal(await AC.IsCrossingFree(crossing1), true, {from: non_admin});
      assert.equal(await AC.IsCrossingFree(crossing1), true, {from: car1});

      await AC.RequestPass(crossing1, 0, {from: car1});
      await AC.LockCrossing(crossing1, {from: train1});

      finished_crossing = await AC.crossings(crossing1);

      assert.equal(finished_crossing.state, cr_state_LOCK_REQUESTED);
      assert.equal(await AC.IsCrossingFree(crossing1), false, {from: admin});
      assert.equal(await AC.IsCrossingFree(crossing1), false, {from: non_admin});
      assert.equal(await AC.IsCrossingFree(crossing1), false, {from: car1});

      await AC.ReleasePass({from: car1});

      finished_crossing = await AC.crossings(crossing1);

      assert.equal(finished_crossing.state, cr_state_LOCKED);
      assert.equal(await AC.IsCrossingFree(crossing1), true, {from: admin});
      assert.equal(await AC.IsCrossingFree(crossing1), true, {from: non_admin});
      assert.equal(await AC.IsCrossingFree(crossing1), true, {from: car1});

    });

    it("Authority test", async () => {
      assert.equal(admin, await AC.getAuthority());
    });

  });
  
});