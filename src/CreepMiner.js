/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
var Cache = require('Cache');
var Const = require('Const');

function CreepMiner(creep, roomWrapper) {
	this.cache = new Cache();
	this.creep = creep;
	this.roomWrapper = roomWrapper;
	this.resource = false;
	this.action = this.creep.memory['action'];
	this.resource = {};
	this.deposit = {};
};

CreepMiner.prototype.init = function() {
	this.remember('role', 'CreepMiner');

	if(!this.remember('source')) {
		var src = this.roomWrapper.getAvailableResource();
		this.remember('source', src.id);
	}
	if(!this.remember('srcRoom')) {
		this.remember('srcRoom', this.creep.room.name);
	}
	if(this.moveToNewRoom() == true) {
		return;
	}
    dest = this.roomWrapper.getClosestEmptyDeposit(this.creep);

	this.remember('destination', dest);
    this.deposit = dest;
	this.resource = this.roomWrapper.getResourceById(this.remember('source'));

	this.act();
};

CreepMiner.prototype.act = function() {
	var avoidArea = this.getAvoidedArea();

//	this.giveEnergy();                                                          // Give energy to nearby creeps if they need it
	Const.debug('miner', 'Energy = ' + this.creep.carry.energy + '/' + this.creep.carryCapacity);
	if(this.creep.carry.energy == this.creep.carryCapacity) {                  // If it is full,
	    Const.debug('miner', 'Full energy');
	    this.action = Const.ACTION_DEPOSIT;                                     // Start depositing this tick
		this.creep.memory['action'] = Const.ACTION_DEPOSIT;                     // Remember to deposit
	}
	if(this.creep.memory['action'] == Const.ACTION_DEPOSIT)                     // If was depositing last tick
	{
	    Const.debug('miner', 'Depositing');
	    if(this.creep.carry.energy == 0) {                                       // If last tick emptied it
	    Const.debug('miner', 'But im empty');
	        this.remember('action', Const.ACTION_HARVEST)                       // Remember to start harvesting next tick
	        return;
	    };
        Const.debug('miner','Depositing to: '+ this.deposit);
        if(this.creep.transfer(this.deposit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // Deposit energy if I am close enough
    	    Const.debug('miner', 'I can\'t deposit, im too far away');
            this.creep.moveTo(this.deposit, {avoid: avoidArea});                     // If not, move closer.
        }
	};
	if(this.creep.memory['action'] == Const.ACTION_HARVEST) {                       // If I was harvesting last tick,
	    Const.debug('miner', 'Harvesting');
	    if(this.creep.carry.energy == this.creep.carryCapacity) {                    // And if last tick filled me up,
    	    Const.debug('miner', 'But I\'m full');
	        this.remember('action', Const.ACTION_DEPOSIT)                       // Remember to start harvesting next tick
	        return;
	    };
	    Const.debug('miner', 'Trying to harvest');
        if(this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {             // Harvest energy if I am close enough                                      
    	    Const.debug('miner', 'Im not close enough to harvest');
    	    this.creep.moveTo(this.resource, {avoid: avoidArea});               // If not, move closer
//    	    this.remember('last-energy', this.creep.energy);                    // Remember where I am moving to for next tick
        }
    }
}

CreepMiner.prototype.giveEnergy = function() {                                  // Searches for neerby creeps that need energy and gives it to them
	var creepsNear = this.creep.pos.findInRange(FIND_MY_CREEPS, 1);
	if(creepsNear.length){
		for(var n in creepsNear){
			if(creepsNear[n].memory.role === 'CreepMiner'){
				if(creepsNear[n].memory['last-energy'] == creepsNear[n].energy
				    && creepsNear[n].energy < creepsNear[n].carryCapacity) {
					this.creep.transfer(creepsNear[n], 'energy');
				}
			}
		}
	}
}

module.exports = CreepMiner;


