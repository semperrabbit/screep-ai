var HelperFunctions = require('HelperFunctions');

var CreepBase = require('CreepBase');
var CreepBuilder = require('CreepBuilder');
var CreepMiner = require('CreepMiner');
var CreepSoldier = require('CreepSoldier');
var CreepHealer = require('CreepHealer');
var CreepScout = require('CreepScout');
var CreepCarrier = require('CreepCarrier');
var CreepShooter = require('CreepShooter');
var CreepUpgrader = require('CreepUpgrader');
var Const = require('Const');

/*
Adding new type:

add to load switch
add to switch after 'console.log('Spawn level ' + level + ' ' + creepType + '(' + creepLevel + '/' + resourceLevel + ')');'

*/


function CreepFactory(depositManager, resourceManager, constructionsManager, population, roomHandler) {
	this.depositManager = depositManager;
	this.roomWrapper = depositManager;
	this.resourceManager = resourceManager;
	this.population = population;
	this.constructionsManager = constructionsManager;
	this.roomHandler = roomHandler;
};

CreepFactory.prototype.load = function(creep) {
	var loadedCreep = null;
	var role = creep.memory.role;
	if(!role) {
		role = creep.name.split('-')[0];
	}

	switch(role) {
		case 'CreepMiner':
			loadedCreep = new CreepMiner(creep, this.roomWrapper);
		break;
        case 'CreepUpgrader':
			loadedCreep = new CreepUpgrader(creep, this.roomWrapper);
		break;
		case 'CreepBuilder':
			loadedCreep = new CreepBuilder(creep, this.roomWrapper);
		break;
/*		case 'CreepSoldier':
			loadedCreep = new CreepSoldier(creep);
		break;
		case 'CreepHealer':
			loadedCreep = new CreepHealer(creep);
		break;
		case 'CreepCarrier':
			loadedCreep = new CreepCarrier(creep, this.roomWrapper);
		break;
		case 'CreepShooter':
			loadedCreep = new CreepShooter(creep);
		break;
*/
	}

	if(!loadedCreep) {
		return false;
	}

	HelperFunctions.extend(loadedCreep, CreepBase);
	loadedCreep.init();

	return loadedCreep;
};

CreepFactory.prototype.new = function(creepType, spawn) {
	var abilities = [];
	var id = new Date().getTime();
	var creepLevel = this.population.getTotalPopulation() / this.population.populationLevelMultiplier;
	var resourceLevel = this.depositManager.getFullDeposits().length / 5;
	var level = Math.floor(creepLevel + resourceLevel);
	if(this.population.getTotalPopulation() < 5){
		level = 1;
	}
	// TOUGH          10
	// MOVE           50
	// CARRY          50
	// ATTACK         80
	// WORK           100
	// RANGED_ATTACK  150
	// HEAL           200

    abilities = Const.getCreepAbilities(creepType, level);
//    Const.debug('factory', abilities);

    var canCreate = spawn.canCreateCreep(abilities, creepType + '-' + id, {role: creepType});
    if(canCreate == ERR_NOT_ENOUGH_ENERGY && level > 1) {
        canCreate = spawn.canCreateCreep(Const.getCreepAbilities(creepType, level-1), creepType + '-' + id, {role: creepType});
    }
    var errMsg    = '';
    switch(canCreate){
        case OK:
            break;
        case ERR_NOT_OWNER:
            errMsg = 'You do not own this spawn';
            break;
        case ERR_NAME_EXISTS:
            errMsg = 'The creep name already exists';
            break;
        case ERR_BUSY:
            errMsg = 'The spawn is busy';
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            errMsg = 'There is not enough energy';
            break;
        case ERR_INVALID_ARGS:
            errMsg = 'Arguements are invalid';
            break;
        case ERR_RCL_NOT_ENOUGH:
            errMsg = 'Too low of RCL';
            break;
        default:
            errMsg = 'Unknowk error';
    }

	if(canCreate != OK) {
		console.log('Can not build creep: ' + creepType + ' @ ' + level + ': ' + errMsg);
		return;
	}

	console.log('Spawn level ' + level + ' ' + creepType + '(' + creepLevel + '/' + resourceLevel + ')');
    switch(creepType) {
	   case 'CreepMiner': 
	   case 'CreepUpgrader':
	   case 'CreepBuilder':
	        spawn.createCreep(abilities, creepType + '-' + id, {role: creepType, action: Const.ACTION_HARVEST});
            break;
        default:
            spawn.createCreep(abilities, creepType + '-' + id, {role: creepType});
	}
};


module.exports = CreepFactory;
