/*
Constants and helper functions
all methods and values are static, and no instance of this class will be created
*/
/*
Add new type:

add MAX and PERCENT constants
add new actions
add to switch in getCreepAbilities
*/

function Const() {};

// POPULATION VALUES
Const.MINER_MAX        = 8;
Const.MINER_PERCENT    = 0.33333333;
Const.UPGRADER_MAX     = 10;
Const.UPGRADER_PERCENT = 0.41666666;
Const.BUILDER_MAX      = 6;
Const.BUILDER_PERCENT  = 0.25;

Const.RAMPART_MAX = 200000;
Const.RAMPART_FIX = 50000;
Const.EMPTY_LEVEL = .90;

Const.ACTION_IDLE    = 0;
Const.ACTION_HARVEST = 1;
Const.ACTION_DEPOSIT = 2;
Const.ACTION_UPGRADE = 3;
Const.ACTION_BUILD   = 4;


Const.DEBUG_ALL         = false;
Const.DEBUG_FACTORY     = false;
Const.DEBUG_MINER       = false;
Const.DEBUG_BUILDER     = false;
Const.DEBUG_POPULATION  = false;
Const.DEBUG_ROOM        = false;
Const.DEBUG_ROOMHANDLER = false;
//Const.DEBUG_

Const.debug = function(source, message) {
    var prefix = 'DEBUG'
    var sendMsg = false;

    if(Const.DEBUG_ALL) {
        console.log(prefix + ' ' + source.toUpperCase() + ': ' + message);
        return;
    }
    switch(source) {
        case 'factory':
            if(Const.DEBUG_FACTORY) {
                prefix = prefix + ' FACTORY';
                sendMsg = true;
            }
            break;
        case 'miner':
            if(Const.DEBUG_MINER) {
                prefix = prefix + ' MINER';
                sendMsg = true;
            }
            break;
        case 'upgrader':
            if(Const.DEBUG_UPGRADER) {
                prefix = prefix + ' UPGRADER';
                sendMsg = true;
            }
            break;
        case 'builder':
            if(Const.DEBUG_BUILDER) {
                prefix = prefix + ' BUILDER';
                sendMsg = true;
            }
            break;
        case 'population':
            if(Const.DEBUG_POPULATION) {
                prefix = prefix + ' POPULATION';
                sendMsg = true;
            }
            break;
        case 'room':
            if(Const.DEBUG_ROOM) {
                prefix = prefix + ' ROOM';
                sendMsg = true;
            }
            break;
        case 'roomhandler':
            if(Const.DEBUG_ROOMHANDLER) {
                prefix = prefix + ' ROOMHANDLER';
                sendMsg = true;
            }
            break;
        default:
            break;
    }
    if(sendMsg) {
        console.log(prefix + ': ' + message);
    }
}

Const.getCreepAbilities = function(creepType, level) {
    var abilities = [];
	switch(creepType) {
    	case 'CreepMiner':
    	case 'CreepBuilder':
    	case 'CreepUpgrader':
    		if(level <= 1) {
    			abilities = [WORK, CARRY, MOVE];
    		} else
    		if(level <= 2) {
    			abilities = [WORK, CARRY, CARRY, MOVE];
    		} else
    		if(level <= 3) {
    			abilities = [WORK, CARRY, CARRY, MOVE, MOVE];
    		} else
    		if(level <= 4) {
    			abilities = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    		} else
    		if(level <= 5) {
    			abilities = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
    		} else
    		if(level <= 6) {
    			abilities = [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE];
    		} else
    		if(level <= 7) {
    			abilities = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    		} else
    		if(level <= 8) {
    			abilities = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    		} else
    		if(level <= 9) {
    			abilities = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
    		} else
    		if(level >= 10) {
    			abilities = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
    		}
    	break;
    	case 'CreepCarrier':
    		if(level <= 1) {
    			abilities = [CARRY, MOVE];
    		} else
    		if(level <= 2) {
    			abilities = [CARRY, CARRY, MOVE];
    		} else
    		if(level <= 3) {
    			abilities = [CARRY, CARRY, MOVE, MOVE];
    		} else
    		if(level <= 4) {
    			abilities = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    		} else
    		if(level <= 5) {
    			abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    		} else
    		if(level <= 6) {
    			abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    		} else
    		if(level <= 7) {
    			abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    		} else
    		if(level <= 8) {
    			abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    		} else
    		if(level <= 9) {
    			abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    		} else
    		if(level >= 10) {
    			abilities = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,  CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    		}
    	break;
    	case 'CreepSoldier':
    		if(level <= 1) {
    			abilities = [TOUGH, ATTACK, MOVE];
    		} else
    		if(level <= 2) {
    			abilities = [TOUGH, MOVE, ATTACK, MOVE];
    		} else
    		if(level <= 3) {
    			abilities = [TOUGH, MOVE, ATTACK, ATTACK, ATTACK, MOVE];
    		} else
    		if(level <= 4) {
    			abilities = [TOUGH, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
    		} else
    		if(level <= 5) {
    			abilities = [TOUGH, TOUGH, TOUGH, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
    		} else
    		if(level <= 6) {
    			abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
    		} else
    		if(level <= 7) {
    			abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
    		} else
    		if(level <= 8) {
    			abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
    		} else
    		if(level <= 9) {
    			abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
    		} else
    		if(level >= 10) {
    			abilities = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE];
    		}
    	break;
    	case 'CreepShooter':
    		if(level <= 5) {
    			abilities = [TOUGH, TOUGH, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, MOVE];
    		} else
    		if(level <= 6) {
    			abilities = [TOUGH, TOUGH, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
    		} else
    		if(level <= 7) {
    			abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
    		} else
    		if(level <= 8) {
    			abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
    		} else
    		if(level <= 9) {
    			abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
    		} else
    		if(level >= 10) {
    			abilities = [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE];
    		}
    	break;
    	case 'CreepScout':
    		abilities = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    	break;
    	case 'CreepHealer':
    		abilities = [MOVE, MOVE, MOVE, HEAL, MOVE];
    	break;
    }
    return abilities;
};

module.exports = Const;