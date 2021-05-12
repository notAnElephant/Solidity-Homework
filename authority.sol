pragma solidity >=0.5.1;
// SPDX-License-Identifier: UNLICENSED

contract AutonomousCrossing {

    // ####### AUTHORITY ##################################################

    address private authority;
    uint256 validity_period = 15 seconds;

    constructor() public {
        authority = msg.sender;
    }
    
    modifier isAdmin() {
        
        require(msg.sender == authority, "You need admin permissions for this action.");
        _;
        
    }

    address scheduler;

    function setScheduler(address schedulerAddress) public isAdmin {
        scheduler = schedulerAddress;
    }

    function ScheduledCheck() public view {

        require(msg.sender == scheduler, "You must be the set scheduler to perform this action.");

        // TODO scheduled task.
        // - FREE signal validity update
        // - check_if_pass_released gedáppáá

    }
    
    // ####### CROSSING ##################################################

    /**
        Defines possible states of the crossing
     */
    enum CrossingTrainState {
        LOCKED, // Noone is able to cross, until the crossing train signals to have left
        FREE, // Cars are allowed to cross, if the crossing is not filled
        LOCK_REQUESTED // No more cars are granted permission to cross
    }

    struct Crossing {
        address id;
        bool isSet;

        CrossingTrainState state;

        address train_lock; // Current train crossing
        uint8 lanes; // Number of lanes in the crossing
        uint8 cars_per_lane; // Allowed cars per lane
        uint16 time_to_pass; // Allowed maximum pass validity

        uint256 freeValidity;

        mapping(uint8=>uint8) carsInLanes;

    }

    modifier isCrossing(address sender) {
        require(crossings[sender].isSet, "Only crossings can perform this action.");
        _;
    }

    modifier isCrossing() {
        isCrossing(msg.sender);
        _;
    }

    mapping (address=>Crossing) crossings;

    function IsCrossingFree(address crossing) public view returns(bool) {

        for(uint8 i = 0; i < crossings[crossing].lanes; i++) {
            if(crossings[crossing].carsInLanes[i] != 0) return false;
        }

        return true;

    }

    function RegisterCrossing(address id, uint8 lanes, uint8 cars_per_lane, uint16 time_to_pass)
    public isAdmin {
        
        Crossing memory c;
        
        c.id = id;
        c.isSet = true;
        
        c.train_lock = address(0);
        c.cars_per_lane = cars_per_lane;
        c.lanes = lanes;
        c.time_to_pass = time_to_pass;

        c.state = CrossingTrainState.FREE;
        c.freeValidity = now + validity_period;
        
        crossings[c.id] = c;
        
    }
    
    function TestCrossing() public isCrossing view returns(bool) {
        return true;
    }
    

/*
    function LockRequest(address crossing) public returns(bool) isTrain {    
        require(crossings[crossing].isSet, "The argument must be registered as a crossing");

        Crossing c = crossings[crossing];

        if(c.state == CrossingTrainState.LOCKED) {
            return false;
        } else if(c.state == CrossingTrainState.FREE) {
            c.state = CrossingTrainState.LOCK_REQUESTED;
            c.train_lock = msg.sender;
            return true;
        
        } else if(c.state == CrossingTrainState.LOCK_REQUESTED) {

        }

    }*/

    // ####### TRAIN ##################################################

    struct Train {
        address id;
        bool isSet;
    }
    
    mapping (address=>Train) trains;
    
    function RegisterTrain(address id) public isAdmin {
        
        Train memory t = Train(id, true);
        trains[t.id] = t;
        
    }

    modifier isTrain() {
        require(trains[msg.sender].isSet, "Only trains can perform this action.");
        _;
    }
    
    function LockCrossing(address crossing) public isTrain isCrossing(crossing) returns(bool) {
        
        if(!crossings[crossing].train_lock.isSet) return false;
        crossings[crossing].train_lock = msg.sender;

        if(IsCrossingFree(crossing)) {
            crossings[crossing].state = CrossingState.LOCKED;
        } else {
            crossings[crossing].state = CrossingState.LOCK_REQUESTED;
                
        }

        return true;
    }

    function ReleaseLock(address crossing) public isTrain isCrossing(crossing){
        


    }
    
    // ####### CAR ##################################################

    struct Car {
        address id;
        bool isSet;
        uint256 passValidity;

        Crossing crossing;
        uint8 lane;

    }
    
    mapping (address=>Car) cars;

    mapping (address=>uint16) tickets;

    function RegisterCar() public {
        
        Car memory c;
        
        c.id = msg.sender;
        c.isSet = true;
        c.passValidity = 0;
        
        cars[c.id] = c;
        
    }

    modifier isCar() {
        require(cars[msg.sender].isSet, "Must be a car to perform this action.");
        _;
    }

    function RequestPass(address crossing, uint8 lane) public isCar returns(uint256) {
        
        Crossing storage cr = crossings[crossing];
        
        Car storage car = cars[msg.sender];
        
        require(cr.isSet, "Invalid request - not a crossing");
        require(car.passValidity == 0, "You have an open permission. Close it first.");
        require(cr.state == CrossingState.FREE, "Crossing is not permitted at the moment.");
        require(now <= cr.freeValidity, "WARN: Validity of free crossing expired. ASSUMING LOCKED.");
        require(lane < cr.lanes, "Invalid lane.");
        require(cr.carsInLanes[lane] < cr.cars_per_lane, "Lane is full. Try again later! :)");
        
        car.crossing.carsInLanes[lane]++;
        
        car.passValidity = now + cr.time_to_pass;

        car.lane = lane;
        car.crossing = cr;
            
        return car.passValidity;

    }

    function ReleasePass() public isCar {

        require(cars[msg.sender].passValidity != 0, "You have no valid pass at the moment.");
        Crossing storage cross = cars[msg.sender].crossing;
        require(cars[msg.sender].crossing.carsInLanes[cars[msg.sender].lane] > 0, "W h a t");

        cars[msg.sender].crossing.carsInLanes[cars[msg.sender].lane]--;
        cars[msg.sender].passValidity = 0;

    }

    function CheckIfPassIsReleased() public isCar {
        if(cars[msg.sender].passValidity != 0) //the car still owns their pass, which is considered illegal
        {
            // Do you know why I pulled you over, sir?
            tickets[msg.sender]++;
        }
    }

}