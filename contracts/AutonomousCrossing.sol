pragma solidity >=0.5.1;
pragma experimental ABIEncoderV2;
// SPDX-License-Identifier: UNLICENSED

contract AutonomousCrossing {

    // ####### AUTHORITY ##################################################

    address public authority;
    uint256 public validity_period = 60 seconds;
    uint256 public train_halt_timeout = 30 seconds;

    // // Ignore warning:
    constructor() public {
        authority = msg.sender;
    }
    
    /*constructor(address admin) {
        authority = admin; 
    }*/

    function getAuthority() public view returns(address) {
        return authority;
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

    // ####### CROSSING + LANES ##################################################

    /**
        Defines possible states of the crossing
     */
    enum CrossingState  {
        LOCKED, // Noone is able to cross, until the crossing train signals to have left
        FREE, // Cars are allowed to cross, if the crossing is not filled
        LOCK_REQUESTED // No more cars are granted permission to cross
    }
    
    struct Lanes {
        address id;
        bool isSet;
        uint8 lane_num; // Number of lanes in the crossing
        uint8 cars_per_lane; // Allowed cars per lane

        uint8[] lanes;
    }

    struct Crossing {
        address id;
        bool isSet;

        CrossingState state;
        
        address train_lock; // Current train crossing
        uint256 lock_request_time; // Lock request timestamp

        uint16 time_to_pass; // Allowed maximum pass validity

        uint256 freeValidity;

    }

    mapping (address=>Crossing) public crossings; // Stores addresses of the crossings.
    mapping (address=>Lanes) public crossing_lanes; // Stores lane data for crossing addresses.

    modifier isCrossing() {
        require(crossings[msg.sender].isSet, "Only crossings can perform this action.");
        _;
    }

    modifier assumeCrossing(address cross) {
        require(crossings[cross].isSet, "Not a crossing.");
        _;
    }

    function IsCrossingFree(address crossing) public assumeCrossing(crossing) view returns(bool) {

        for(uint8 i = 0; i < crossing_lanes[crossing].lane_num; i++) {
            if(crossing_lanes[crossing].lanes[i] != 0) return false;
        }

        return true;

    }

    function RegisterCrossing(address id, uint8 lanes, uint8 cars_per_lane, uint16 time_to_pass)
    public isAdmin {
        
        Crossing memory c;
        Lanes memory l;
        
        c.id = id;
        l.id = id;
        c.isSet = true;
        l.isSet = true;

        c.train_lock = address(0);
        c.state = CrossingState.FREE;
        c.freeValidity = block.timestamp + validity_period;
        c.time_to_pass = time_to_pass;

        l.cars_per_lane = cars_per_lane;
        l.lane_num = lanes;
        
        l.lanes = new uint8[](l.lane_num);

        crossings[c.id] = c;
        crossing_lanes[c.id] = l;
        
    }

    // ####### TRAIN ##################################################

    struct Train {
        address id;
        bool isSet;
    }
    
    mapping (address=>Train) public trains;
    
    function RegisterTrain(address id) public isAdmin {
        
        Train memory t = Train(id, true);
        trains[t.id] = t;
        
    }

    modifier isTrain() {
        require(trains[msg.sender].isSet, "Only trains can perform this action.");
        _;
    }

    enum LockResponse {
        ANOTHER_LOCK_IS_ACTIVE,
        LOCK_SUCCESSFUL,
        LOCK_REQUESTED,
        HALT
    }

    function LockCrossing(address crossing) public isTrain assumeCrossing(crossing) returns(uint8) {

        if(crossings[crossing].train_lock == address(0)) {
            crossings[crossing].lock_request_time = block.timestamp;        
            crossings[crossing].train_lock = msg.sender;
        }

        if(crossings[crossing].train_lock != msg.sender) {
            return uint8(LockResponse.ANOTHER_LOCK_IS_ACTIVE);
        }

        if(IsCrossingFree(crossing)) {
            crossings[crossing].state = CrossingState.LOCKED;
            return uint8(LockResponse.LOCK_SUCCESSFUL);
        } else if(block.timestamp < crossings[crossing].lock_request_time + train_halt_timeout) {
            crossings[crossing].state = CrossingState.LOCK_REQUESTED;
            return uint8(LockResponse.LOCK_REQUESTED);
        } else {
            crossings[crossing].state = CrossingState.LOCK_REQUESTED;
            return uint8(LockResponse.HALT);
        }
    }

    function ReleaseLock(address crossing) public isTrain assumeCrossing(crossing) {

        require(crossings[crossing].train_lock == msg.sender, "Another train has the release permissions.");
        crossings[crossing].train_lock = address(0);
        crossings[crossing].lock_request_time = 0;
        crossings[crossing].state = CrossingState.FREE;

    }
    
    // ####### CAR ##################################################

    struct Car {
        address id;
        bool isSet;
        uint256 passValidity;

        Crossing crossing;
        uint8 lane;

    }
    
    mapping (address=>Car) public cars;
    mapping (address=>uint16) public tickets;

    function RegisterCar() public {
        
        require(!cars[msg.sender].isSet, "Already registered as a car.");
        require(!trains[msg.sender].isSet, "Already registered as a train.");
        require(!crossings[msg.sender].isSet, "Already registered as a crossing.");
        
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
        require(block.timestamp <= cr.freeValidity, "WARN: Validity of free crossing expired. ASSUMING LOCKED.");
        require(lane < crossing_lanes[crossing].lane_num, "Invalid lane.");
        require(crossing_lanes[crossing].lanes[lane] < crossing_lanes[crossing].cars_per_lane, "Lane is full. Try again later! :)");
        
        crossing_lanes[crossing].lanes[lane]++;
        
        car.passValidity = block.timestamp + cr.time_to_pass;

        car.lane = lane;
        car.crossing = cr;
            
        return car.passValidity;

    }

    function ReleasePass() public isCar {

        require(cars[msg.sender].passValidity != 0, "You have no valid pass at the moment.");
        require(crossing_lanes[cars[msg.sender].crossing.id].lanes[cars[msg.sender].lane] > 0, "W h a t");

        crossing_lanes[cars[msg.sender].crossing.id].lanes[cars[msg.sender].lane]--;
        cars[msg.sender].passValidity = 0;

        address crossingid = cars[msg.sender].crossing.id;

        if(IsCrossingFree(crossingid) && crossings[crossingid].state == CrossingState.LOCK_REQUESTED) {
            crossings[crossingid].state = CrossingState.LOCKED;
        }

    }

    function IsPassValid() public isCar view returns(bool) {
        return block.timestamp < cars[msg.sender].passValidity;
    }

    function CheckIfPassIsReleased() public isCar {
        if(cars[msg.sender].passValidity != 0) //the car still owns their pass, which is considered illegal
        {
            // Do you know why I pulled you over, sir?
            tickets[msg.sender]++;
        }
    }

    function IsCar(address c) public view returns(bool) {
        return cars[c].isSet;
    }
    
    function IsTrain(address c) public view returns(bool){
        return trains[c].isSet;
    }

    function IsCrossing(address c) public view returns(bool) {
        return crossings[c].isSet;
    }
}