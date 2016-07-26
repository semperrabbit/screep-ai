/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
var Cache = require('Cache');
var Const = require('Const');

function CreepUpgrader(creep, roomWrapper) {
	this.cache = new Cache();
	this.creep = creep;
	this.roomWrapper = roomWrapper;
	this.resource = false;
	this.action = this.creep.memory['action'];
	this.resource = {};
	this.rmController = this.creep.room.controller;
};

CreepUpgrader.prototype.init = function() {
	this.remember('role', 'CreepUpgrader');

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
/////////////////////////////////////////////////////////////////////////////////////////////////////

	this.resource = this.roomWrapper.getResourceById(this.remember('source'));

	this.act();
};

CreepUpgrader.prototype.act = function() {
	var avoidArea = this.getAvoidedArea();

	Const.debug('upgrader', 'Energy = ' + this.creep.carry.energy + '/' + this.creep.carryCapacity);
	if(this.creep.carry.energy == this.creep.carryCapacity) {                  // If it is full,
	    Const.debug('upgrader', 'Full energy');
	    this.action = Const.ACTION_UPGRADE;                                     // Start depositing this tick
		this.creep.memory['action'] = Const.ACTION_UPGRADE;                     // Remember to deposit
	}
	if(this.creep.memory['action'] == Const.ACTION_UPGRADE)                     // If was depositing last tick
	{
	    Const.debug('upgrader', 'Upgrading');
	    if(this.creep.carry.energy == 0) {                                       // If last tick emptied it
	    Const.debug('upgrader', 'But im empty');
	        this.remember('action', Const.ACTION_HARVEST)                       // Remember to start harvesting next tick
	        return;
	    };
        Const.debug('upgrader','Upgrading to: '+ this.rmController);
        if(this.creep.transfer(this.rmController, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // Deposit energy if I am close enough
    	    Const.debug('upgrader', 'I can\'t deposit, im too far away');
            this.creep.moveTo(this.rmController, {avoid: avoidArea});                     // If not, move closer.
        }
	};
	if(this.creep.memory['action'] == Const.ACTION_HARVEST) {                       // If I was harvesting last tick,
	    Const.debug('upgrader', 'Harvesting');
	    if(this.creep.carry.energy == this.creep.carryCapacity) {                    // And if last tick filled me up,
    	    Const.debug('upgrader', 'But I\'m full');
	        this.remember('action', Const.ACTION_UPGRADE)                       // Remember to start harvesting next tick
	        return;
	    };
	    Const.debug('upgrader', 'Trying to harvest');
        if(this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {             // Harvest energy if I am close enough                                      
    	    Const.debug('upgrader', 'Im not close enough to harvest');
    	    this.creep.moveTo(this.resource, {avoid: avoidArea});               // If not, move closer
//    	    this.remember('last-energy', this.creep.energy);                    // Remember where I am moving to for next tick
        }
    }
}

module.exports = CreepUpgrader;


