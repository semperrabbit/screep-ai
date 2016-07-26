/*
TODO: give explanation of why creep cannot be built
TODO: add debug

*/


var HelperFunctions = require('HelperFunctions');
var RoomHandler = require('RoomHandler');
var ScoutHandler = require('ScoutHandler');
var Room = require('Room');
var CreepBase = require('CreepBase');
var CreepScout = require('CreepScout');
var Const = require('Const');

//ScoutHandler.setRoomHandler(RoomHandler);

// Init rooms
for(var n in Game.rooms) {
	var roomHandler = new Room(Game.rooms[n], RoomHandler);
	RoomHandler.set(Game.rooms[n].name, roomHandler);
};

// Load rooms
var rooms = RoomHandler.getRoomHandlers();
for(var n in rooms) {
	var room = rooms[n];
	room.loadCreeps();
	room.populate();

	console.log(
		room.room.name + ' | ' +
		'goals met:' +
		room.population.goalsMet() +
		', population: ' +
		room.population.getTotalPopulation() + '/' + room.population.getMaxPopulation() +
		' (' + //room.population.getType('CreepBuilder').total + '/' +
		room.population.getType('CreepMiner').total + '/' +
		room.population.getType('CreepUpgrader').total + '/' +
		room.population.getType('CreepBuilder').total + 
		'), ' +
		'resources at: ' + parseInt( (room.depositManager.energy() / room.depositManager.energyCapacity())*100) +'%, ' +
		'max resources: ' + room.depositManager.energyCapacity() +'u, ' +
		'next death: ' + room.population.getNextExpectedDeath() +' ticks'
	);
};

// Load scouts.
//ScoutHandler.loadScouts();
//ScoutHandler.spawnNewScouts();

HelperFunctions.garbageCollection();

