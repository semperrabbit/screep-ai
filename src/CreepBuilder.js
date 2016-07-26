/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
var Cache = require('Cache');
var Const = require('Const');

function CreepBuilder(creep, roomWrapper) {
	this.cache = new Cache();
	this.creep = creep;
	this.roomWrapper = roomWrapper;
	this.resource = false;
	this.action = this.creep.memory['action'];
	this.resource = {};
    this.target = this.creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    if(this.target == null) {                           // If there are no construction sites, ugrade controller...
        this.target = this.creep.room.controller;
    }
    Const.debug('builder', 'Target: '+this.target);
    
//    if(this.target.typeof())
};

CreepBuilder.prototype.init = function() {
	this.remember('role', 'CreepBuilder');

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

CreepBuilder.prototype.act = function() {
	var avoidArea = this.getAvoidedArea();

	Const.debug('builder', 'Energy = ' + this.creep.carry.energy + '/' + this.creep.carryCapacity);
	if(this.creep.carry.energy == this.creep.carryCapacity) {                  // If it is full,
	    Const.debug('builder', 'Full energy');
	    this.action = Const.ACTION_BUILD;                                     // Start building this tick
		this.creep.memory['action'] = Const.ACTION_BUILD;                     // Remember to build
	}

	if(this.creep.memory['action'] == Const.ACTION_BUILD)                     // If was building last tick
	{
	    Const.debug('builder', 'Building');
	    if(this.creep.carry.energy == 0) {                                       // If last tick emptied it
	    Const.debug('builder', 'But im empty');
	        this.remember('action', Const.ACTION_HARVEST)                       // Remember to start harvesting next tick
	    };
        Const.debug('builder','Building: '+ this.target);
        if(this.target != this.creep.room.controller) {                             // If target is a construction site,
            if(this.creep.build(this.target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {// Build if I am close enough
                Const.debug('builder', 'I can\'t build, im too far away');
                this.creep.moveTo(this.target, {avoid: avoidArea});                 // If not, move closer.
            }
         }
        if(this.target == this.creep.room.controller) {                  
            Const.debug('builder', "There are no active construction sites... Upgrading controller"); // No open construction sites...
            if(this.creep.upgradeController(this.target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { // Upgrade controller if I am close enough
        	    Const.debug('builder', 'I can\'t upgrade, im too far away');
                this.creep.moveTo(this.target, {avoid: avoidArea});                     // If not, move closer.
            }
        }
	};
	if(this.creep.memory['action'] == Const.ACTION_HARVEST) {                       // If I was harvesting last tick,
	    Const.debug('builder', 'Harvesting');
	    if(this.creep.carry.energy == this.creep.carryCapacity) {                    // And if last tick filled me up,
    	    Const.debug('builder', 'But I\'m full');
	        this.remember('action', Const.ACTION_BUILD)                       // Remember to start harvesting next tick
	        return;
	    };
	    Const.debug('builder', 'Trying to harvest');
        if(this.creep.harvest(this.resource) == ERR_NOT_IN_RANGE) {             // Harvest energy if I am close enough                                      
    	    Const.debug('builder', 'Im not close enough to harvest');
    	    this.creep.moveTo(this.resource, {avoid: avoidArea});               // If not, move closer
//    	    this.remember('last-energy', this.creep.energy);                    // Remember where I am moving to for next tick
        }
    }
}

module.exports = CreepBuilder;



/*
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

//	    if(creep.memory.building) {
//	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
//            if(targets.length) {
//                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
//                    creep.moveTo(targets[0]);
//                }
//            }
//	    }
	    else {
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
	    }
	}
};
*/