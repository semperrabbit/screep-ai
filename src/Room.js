//var Deposits = require('Deposits');
var CreepFactory = require('CreepFactory');
var Population = require('Population');
//var Resources = require('Resources');
//var Constructions = require('Constructions');
var Cache = require('Cache');
var Const = require('Const');

function Room(room, roomHandler) {
	this.room = room;
	this.roomHandler = roomHandler;
	this.creeps = [];
	this.structures = [];
	this.cache = new Cache();
	this.deposits = this.room.find(
		FIND_MY_STRUCTURES,
		{
			filter: filterExtensions
		}
	);

	this.spawns = [];
	for(var n in Game.spawns) {
		var s = Game.spawns[n];
		if(s.room == this.room) {
			this.spawns.push(s);
		}
	}

    this.sites = this.room.find(FIND_CONSTRUCTION_SITES);
    this.structures = this.room.find(FIND_MY_STRUCTURES);
    this.damagedStructures = this.getDamagedStructures();
    this.upgradeableStructures = this.getUpgradeableStructures();
    this.controller = this.room.controller;
	this.population = new Population(this.room);
	this.depositManager = this;
	this.resourceManager = this;
	this.constructionManager = this;
//	this.population.typeDistribution.CreepBuilder.max = 4;
	this.population.typeDistribution.CreepMiner.max = (this.getSources().length+1)*2;
//	this.population.typeDistribution.CreepCarrier.max = this.population.typeDistribution.CreepBuilder.max+this.population.typeDistribution.CreepMiner.max;
	this.creepFactory = new CreepFactory(this, this, this, this.population, this.roomHandler);
}

Room.prototype.askForReinforcements = function() {
	console.log(this.room.name + ': ask for reinforcements.');
	this.roomHandler.requestReinforcement(this);
};

Room.prototype.sendReinforcements = function(room) {
	if(!Memory[this.room.name]) {
		Memory[this.room.name] = {};
	}
	var alreadySending = false;
	for(var i = 0; i < this.population.creeps.length; i++) {
		var creep = this.population.creeps[i];
		if(creep.memory.targetRoom == room.room.name) {
			alreadySending = true;
			break;
		}
	}
	if(alreadySending) {
		console.log(this.room.name + ': already given reinforcements');
		return;
	}
	if(this.population.getTotalPopulation() < this.population.getMaxPopulation()*0.8) {
		console.log(this.room.name + ': Not enough resources ' + '(' + this.population.getTotalPopulation() + '/' + this.population.getMaxPopulation()*0.8 + ')');
		return;
	}

	var sentType = [];
	for(var i = 0; i < this.population.creeps.length; i++) {
		var creep = this.population.creeps[i];
		if(creep.ticksToLive < 1000) {
			continue;
		}
		if(sentType.indexOf(creep.memory.role) == -1) {
			sentType.push(creep.memory.role);
			console.log('sending: ' + creep.memory.role);
			creep.memory.targetRoom = room.room.name;
		}
	}
}

Room.prototype.populate = function() {
	if(this.depositManager.spawns.length == 0 && this.population.getTotalPopulation() < 10) {
		this.askForReinforcements()
	}

	for(var i = 0; i < this.depositManager.spawns.length; i++) {
		var spawn = this.depositManager.spawns[i];
		if(spawn.spawning) {
			continue;
		}

		if((this.energy() / this.energyCapacity()) > 0.2) {
			var types = this.population.getTypes()
			for(var i = 0; i < types.length; i++) {
				var ctype = this.population.getType(types[i]);

				if(this.deposits.length > ctype.minExtensions) {
					if((ctype.goalPercentage > ctype.currentPercentage && ctype.total < ctype.max) || ctype.total == 0 || ctype.total < ctype.max*0.75) {
						this.creepFactory.new(types[i], this.depositManager.getSpawnDeposit());
						break;
					}
				}
			}
		}
	}

};

Room.prototype.loadCreeps = function() {
	var creeps = this.room.find(FIND_MY_CREEPS);
	for(var n in creeps) {
		var c = this.creepFactory.load(creeps[n]);
		if(c) {
			this.creeps.push(c);
		}
	}
//	this.distributeBuilders();
	this.distributeResources('CreepMiner');
//	this.distributeResources('CreepCarrier');
//	this.distributeCarriers();
};
Room.prototype.distributeBuilders = function() {
	var builderStats = this.population.getType('CreepBuilder');
	if(this.spawns.length == 0) {
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepBuilder') {
				continue;
			}

			creep.remember('forceControllerUpgrade', false);
		}
		return;
	}
	if(builderStats <= 3) {
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepBuilder') {
				continue;
			}
			creep.remember('forceControllerUpgrade', false);
		}
	} else {
		var c = 0;
		for(var i = 0; i < this.creeps.length; i++) {
			var creep = this.creeps[i];
			if(creep.remember('role') != 'CreepBuilder') {
				continue;
			}
			creep.remember('forceControllerUpgrade', true);
			c++;
			if(c == 2) {
				break;
			}
		}
	}
}
Room.prototype.distributeCarriers = function() {
	var counter = 0;
	var builders = [];
	var carriers = [];
	for(var i = 0; i < this.creeps.length; i++) {
		var creep = this.creeps[i];
		if(creep.remember('role') == 'CreepBuilder') {
			builders.push(creep.creep);
		}
		if(creep.remember('role') != 'CreepCarrier') {
			continue;
		}
		carriers.push(creep);
		if(!creep.getDepositFor()) {
			if(counter%2) {
				// Construction
				creep.setDepositFor(1);
			} else {
				// Population
				creep.setDepositFor(2);
			}
		}

		counter++;
	}
	counter = 0;
	for(var i = 0; i < carriers.length; i++) {
		var creep = carriers[i];
		if(creep.remember('role') != 'CreepCarrier') {
			continue;
		}
		if(!builders[counter]) {
			continue;
		}
		var id = creep.remember('target-worker');
		if(!Game.getObjectById(id)) {
			creep.remember('target-worker', builders[counter].id);
		}
		counter++;
		if(counter >= builders.length) {
			counter = 0;
		}
	}
};

Room.prototype.distributeResources = function(type) {
	var sources = this.getSources();//resourcemanager
	var perSource = 0;
	if (sources.length != 0) {
	    perSource = Math.ceil(this.population.getType(type).total/sources.length);
	}
	var counter = 0;
	var source = 0;

	for(var i = 0; i < this.creeps.length; i++) {
		var creep = this.creeps[i];
		if(creep.remember('role') != type) {
			continue;
		}

		if(!sources[source]) {
			continue;
		}

		creep.remember('source', sources[source].id);
		counter++;
		if(counter >= perSource) {
			counter = 0;
			source++;
		}
	}
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////   Deposits    /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

Room.prototype.getSpawnDeposit = function() {
	if(this.spawns.length != 0) {
		return this.spawns[0];
	}

	return false;
};

Room.prototype.getEmptyDeposits = function() {
	return this.cache.remember(
		'empty-deposits',
		function() {
			var empty = [];
			var len = this.deposits.length;
			for(var i = 0; i < len; i++) {
				var res = this.deposits[i];
				if(this.isEmptyDeposit(res)) {
					empty.push(res);
				}
			}

			return empty;
		}.bind(this)
	);
};

Room.prototype.isEmptyDeposit = function(deposit) {
	if(deposit.energy / deposit.energyCapacity < Const.EMPTY_LEVEL) {
		return true;
	}

	return false;
};

Room.prototype.getEmptyDepositOnId = function(id) {
	var resource = Game.getObjectById(id);

	if(resource && this.isEmptyDeposit(resource)) {
		return resource;
	}

	return false;
};

Room.prototype.getClosestEmptyDeposit = function(creep) {
    Const.debug('room', 'Finding closest resource to '+creep);
	var resources = this.getEmptyDeposits();
	var resource = false;
	if(resources.length != 0) {
		resource = creep.pos.findClosestByRange(resources);
	}
	if(!resource) {
		resource = this.getSpawnDeposit();
	}

	return resource;
};

Room.prototype.energy = function() {
	return this.cache.remember(
		'deposits-energy',
		function() {
			var energy = 0;
			var resources = this.deposits;

			for(var i = 0; i < resources.length; i++) {
				var res = resources[i];
				energy += res.energy;
			}

			for(var i = 0; i < this.spawns.length; i++) {
				energy += this.spawns[i].energy;
			}

			return energy;
		}.bind(this)
	);
};

Room.prototype.energyCapacity = function() {
	return this.cache.remember(
		'deposits-energy-capacity',
		function() {
			var energyCapacity = 0;
			var resources = this.deposits;
			for(var i = 0; i < resources.length; i++) {
				var res = resources[i];
				energyCapacity += res.energyCapacity;
			}

			for(var i = 0; i < this.spawns.length; i++) {
				energyCapacity += this.spawns[i].energyCapacity;
			}

			return energyCapacity;
		}.bind(this)
	);
};

Room.prototype.getFullDeposits = function() {
	return this.cache.remember(
		'deposits-full',
		function() {
			var full = [];
			var deposits = this.deposits;
			for(var i = 0; i < deposits.length; i++) {
				var deposit = deposits[i];
				if(deposit.energy == deposit.energyCapacity) {
					full.push(deposit);
				}
			}
			return full;
		}.bind(this)
	);
};

// PRIVATE
function filterExtensions(structure) {
	if(structure.structureType == STRUCTURE_EXTENSION) {
		return true;
	}

	return false;
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////   Resources   /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

Room.prototype.getAvailableResource = function() {
	// Some kind of unit counter per resource (with Population)
	var srcs = this.getSources();
	var srcIndex = Math.floor(Math.random()*srcs.length);

	return srcs[srcIndex];
};
Room.prototype.getResourceById = function(id) {
	return Game.getObjectById(id);
};
Room.prototype.getSources = function(room) {
	return this.cache.remember(
		'sources',
		function() {
			return this.room.find(
				FIND_SOURCES, {
					filter: function(src) {
						var targets = src.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
						if(targets.length == 0) {
						    return true;
						}

						return false;
					}
				}
			);
		}.bind(this)
	);
};


///////////////////////////////////////////////////////////////////////////////
/////////////////////////////   Constructions   ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////

Room.prototype.getDamagedStructures = function() {
    return this.cache.remember(
        'damaged-structures',
        function() {
            return this.room.find(
                FIND_MY_STRUCTURES,
                {
                    filter: function(s) {
                        var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
						if(targets.length != 0) {
						    return false;
						}
                        if((s.hits < s.hitsMax/2 && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits < CONST.RAMPART_FIX)) {
                            return true;
                        }
                    }
                }
            );
        }.bind(this)
    );
};

Room.prototype.getUpgradeableStructures = function() {
    return this.cache.remember(
        'upgradeable-structures',
        function() {
            return this.room.find(
                FIND_MY_STRUCTURES,
                {
                    filter: function(s) {
                        var targets = s.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                        if(targets.length != 0) {
                            return false;
                        }

                        if((s.hits < s.hitsMax && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits < CONST.RAMPART_MAX)) {

                            return true;
                        }
                    }
                }
            );
        }.bind(this)
    );
};

Room.prototype.getConstructionSiteById = function(id) {
    return this.cache.remember(
        'object-id-' + id,
        function() {
            return Game.getObjectById(id);
        }.bind(this)
    );
};

Room.prototype.getController = function() {
    return this.controller;
};

Room.prototype.getClosestConstructionSite = function(creep) {
    var site = false;
    if(this.sites.length != 0) {
        site = creep.pos.findClosest(this.sites);
    }

    return site;
};

Room.prototype.constructStructure = function(creep) {
    var avoidArea = creep.getAvoidedArea();

    if(this.damagedStructures.length != 0) {
        site = creep.creep.pos.findClosest(this.damagedStructures);
        creep.creep.moveTo(site, {avoid: avoidArea});
        creep.creep.repair(site);

        return site;
    }

    if(this.sites.length != 0) {
        site = creep.creep.pos.findClosest(this.sites);
        creep.creep.moveTo(site, {avoid: avoidArea});
        creep.creep.build(site);

        return site;
    }

    if(this.upgradeableStructures.length != 0) {
        site = creep.creep.pos.findClosest(this.upgradeableStructures);
        creep.creep.moveTo(site, {avoid: avoidArea});
        creep.creep.repair(site);

        return site;
    }

    return false;
};


module.exports = Room;
