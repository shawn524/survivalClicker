// Survival Clicker
// An incremental game with a post apocalyptic twist
var version = 0.4;

// Initialize values
var playerAttributes = {
	'name': 'Pip',
	'health': 100,
	'hunger': 0,
	'hungry': false,
	'starving': false,
	'thirst': 0,
	'thirsty': false,
	'dehydrated': false,
	'rads': 10,
	'sick': false,
	'gameOver': false
};
var homeStorage = {
	'maxStorage': {
		food: 0,
		water: 0,
		ammo: 0,
		scrap: 0,
		medpack: 0
	},
	'currentStorage': {
		food: 0,
		water: 0,
		ammo: 0,
		scrap: 0,
		medpack: 0
	}
}
var food = {
	name: 'food',
	total: 0,
	increment: 1,
	chance: 0.1
};
var water = {
	name: 'water',
	total: 0,
	increment: 1,
	chance: 0.2
};
var ammo = {
	name: 'ammo',
	total: 0,
	increment: 1,
	chance: 0.1
};
var scrap = {
	name: 'scrap',
	total: 0,
	increment: 1,
	chance: 0.2
};
var medpack = {
	name: 'medpack',
	total: 0,
	increment: 1,
	chance: 0.1
};
var nothing = {
	name: 'nothing',
	chance: 0.4,
};

var basicSupplies = [food, water, ammo, scrap, medpack, nothing];
var weight = [food.chance, water.chance, ammo.chance, scrap.chance, medpack.chance, nothing.chance];
var lesserMulti = 1;
var greaterMulti = 1;
var daysSurvived = 0;

// Generates a random number between min and max.
var rand = function(min, max) {
	return Math.random() * (max - min) + min;
};

// This function is the main click action. 
// It can take all of the basic supplies you might find and return
// a single random-weighted result as a loot drop. 
var gatherSupplies = function(basicSupplies, weight) {
	var total_weight = weight.reduce(function(prev, cur, i, arr) {
		return prev + cur;
	});
	// console.log('total weight',total_weight);

	var random_num = rand(0, total_weight);
	// console.log('random num', random_num);
	var weight_sum = 0;

	for (var i = 0; i < basicSupplies.length; i++) {
		weight_sum += weight[i];
		// console.log(weight[i]);
		weight_sum = +weight_sum.toFixed(2);
		// console.log('weight sum',weight_sum);
		var item_drop = basicSupplies[i];

		if (random_num <= weight_sum) {
			item_drop.total++;
			console.log('found some', basicSupplies[i].name);
			gameLog('You found some ' + basicSupplies[i].name);
			break;
		}
	}

	// 10 clicks to a day
	daysSurvived += 0.1;
	// Apply certain functions when button pressed to progress game
	updateTotals();
	applyStatusEffect();
	playerStatsRemoval();
	deathCheck();

};

function playerStatsRemoval() {
	playerAttributes.hunger += (1 * lesserMulti * greaterMulti);
	playerAttributes.thirst += (1.2 * lesserMulti * greaterMulti);
	playerAttributes.rads += (1.5 * lesserMulti * greaterMulti);
	// Health removal
	if (playerAttributes.hungry || playerAttributes.thirsty || playerAttributes.sick) {
		playerAttributes.health -= (1 * lesserMulti * greaterMulti);
	}
	if (playerAttributes.starving || playerAttributes.dehydrated) {
		playerAttributes.health -= (1 * lesserMulti * greaterMulti);
	}
}

function deathCheck() {
	if (playerAttributes.health == 0 && !playerAttributes.gameOver) {
		alert("You have succumbed to deaths cold embrace. Your journey has ended.")
		playerAttributes.gameOver = true;
		resetGame();
	}
}

function resetGame() {
	if (confirm("Reset game?")) {
		playerAttributes.health = 100;
		playerAttributes.hunger = 0;
		playerAttributes.hungry = false;
		playerAttributes.starving = false;
		playerAttributes.thirst = 0;
		playerAttributes.thirsty = false;
		playerAttributes.dehydrated = false;
		playerAttributes.rads = 10;
		playerAttributes.sick = false;
		playerAttributes.gameOver = false;
		food.total = 0;
		water.total = 0;
		ammo.total = 0;
		scrap.total = 0;
		medpack.total = 0;
		daysSurvived = 0;
	} else {
		// disable buttons?
	}
}

function updateTotals() {
	// Supplies
	document.getElementById('food_count').innerHTML = food.total.toFixed(0);
	document.getElementById('water_count').innerHTML = water.total.toFixed(0);
	document.getElementById('ammo_count').innerHTML = ammo.total.toFixed(0);
	document.getElementById('scrap_metal_count').innerHTML = scrap.total.toFixed(0);
	document.getElementById('medical_supplies_count').innerHTML = medpack.total.toFixed(0);
	// Attributes
	document.getElementById('health_count').innerHTML = playerAttributes.health.toFixed(0);
	document.getElementById('hunger_count').innerHTML = playerAttributes.hunger.toFixed(0);
	document.getElementById('thirst_count').innerHTML = playerAttributes.thirst.toFixed(0);
	document.getElementById('rads_count').innerHTML = playerAttributes.rads.toFixed(0);
	// Days survived rounded down
	document.getElementById('days_survived_count').innerHTML = Math.floor(daysSurvived).toFixed(0);
	// Structure costs and discriptions
	document.getElementById('hole_cost').innerHTML = buildings[0].cost;
	document.getElementById('hole_discription').innerHTML = buildings[0].discription;
	document.getElementById('shack_cost').innerHTML = buildings[1].cost;
	document.getElementById('shack_discription').innerHTML = buildings[1].discription;
	document.getElementById('hut_cost').innerHTML = buildings[2].cost;
	document.getElementById('hut_discription').innerHTML = buildings[2].discription;

};

function statsLimiter() {
	// Player stats limiter
	if (playerAttributes.health >= 100) {
		playerAttributes.health = 100;
	}
	if (playerAttributes.hunger >= 100) {
		playerAttributes.hunger = 100;
	}
	if (playerAttributes.thirst >= 100) {
		playerAttributes.thirst = 100;
	}
	if (playerAttributes.rads >= 200) {
		playerAttributes.rads = 200;
	}
	if (playerAttributes.health <= 0) {
		playerAttributes.health = 0;
	}
	if (playerAttributes.hunger <= 0) {
		playerAttributes.hunger = 0;
	}
	if (playerAttributes.thirst <= 0) {
		playerAttributes.thirst = 0;
	}
	if (playerAttributes.rads <= 0) {
		playerAttributes.rads = 0;
	}
}

function applyStatusEffect() {
	// Hunger
	if (playerAttributes.hunger < 60) {
		playerAttributes.hungry = false;
		playerAttributes.starving = false;
	} else if ((playerAttributes.hunger >= 60 && playerAttributes.hunger < 100) && !playerAttributes.starving) {
		playerAttributes.hungry = true;
		gameLog("You are hungry");
	} else if (playerAttributes.hunger >= 100) {
		playerAttributes.hungry = false;
		playerAttributes.starving = true;
		gameLog("You are starving");
	};
	// Thirst
	if (playerAttributes.thirst < 60) {
		playerAttributes.thirsty = false;
		playerAttributes.dehydrated = false;
	} else if ((playerAttributes.thirst >= 60 && playerAttributes.thirst < 100) && !playerAttributes.dehydrated) {
		playerAttributes.thirsty = true;
		gameLog("You are thirsty");
	} else if (playerAttributes.thirst >= 100) {
		playerAttributes.thirsty = false;
		playerAttributes.dehydrated = true;
		gameLog("You are dehydrated");
	};
	// Rad sickness
	if (playerAttributes.rads < 100) {
		playerAttributes.sick = false;
	} else if (playerAttributes.rads >= 100 && playerAttributes.rads < 200) {
		playerAttributes.sick = true;
		gameLog("You have radiation sickness");
	} else if (playerAttributes.rads == 200) {
		playerAttributes.health = 0;
	};
};

// Checks player condition and applies status modification
function statusMulti() {
	// Status multiplier
	// Lesser status effects
	// If none or one 
	if (!playerAttributes.hungry && !playerAttributes.thirsty && !playerAttributes.sick) {
		lesserMulti = 1.0;
	}
	if (playerAttributes.hungry || playerAttributes.thirsty || playerAttributes.sick) {
		lesserMulti = 1.5;
	};
	// If any two
	if (playerAttributes.hungry && playerAttributes.thirsty) {
		lesserMulti = 3.0;
	} else if (playerAttributes.hungry && playerAttributes.sick) {
		lesserMulti = 3.0;
	} else if (playerAttributes.thirsty && playerAttributes.sick) {
		lesserMulti = 3.0;
	};
	// If three
	if (playerAttributes.hungry && playerAttributes.thirsty && playerAttributes.sick) {
		lesserMulti = 4.5;
	};

	// Greater status effects
	// If one or none
	if (!playerAttributes.starving && !playerAttributes.dehydrated) {
		greaterMulti = 1.0;
	}
	if (playerAttributes.starving || playerAttributes.dehydrated) {
		greaterMulti = 2.0;
	}
	// If both
	if (playerAttributes.starving && playerAttributes.dehydrated) {
		greaterMulti = 4.0;
	}

	// Display to player
	// Hunger
	if (playerAttributes.hungry) {
		document.getElementById('hungry_status').className = "hungry_status";
		document.getElementById('starving_status').className += " hidden";
	} else if (playerAttributes.starving) {
		document.getElementById('starving_status').className = "starving_status";
		document.getElementById('hungry_status').className += " hidden";
	} else {
		document.getElementById('hungry_status').className += " hidden";
		document.getElementById('starving_status').className += " hidden";
	};
	// Thirst
	if (playerAttributes.thirsty) {
		document.getElementById('thirsty_status').className = "thirsty_status";
		document.getElementById('dehydrated_status').className += " hidden";
	} else if (playerAttributes.dehydrated) {
		document.getElementById('dehydrated_status').className = "dehydrated_status";
		document.getElementById('thirsty_status').className += " hidden";
	} else {
		document.getElementById('thirsty_status').className += " hidden";
		document.getElementById('dehydrated_status').className += " hidden";
	};
	// Rad sickness
	if (playerAttributes.sick) {
		document.getElementById('sick_status').className = "sick_status";
	} else {
		document.getElementById('sick_status').className += " hidden";
	};
}

// Item usage
function useItem(item) {
	if (item.total > 0) {
		item.total -= 1;
		if (item.name == 'medpack') {
			playerAttributes.health += 20;
			playerAttributes.rads -= 20;
		} else if (item.name == 'food') {
			playerAttributes.hunger -= 10;
		} else if (item.name == 'water') {
			playerAttributes.thirst -= 12;
		}
	} else {
		gameLog('Not enough ' + item.name);
	}
}

// Build, maintain, and upgrade structures 
var shelter = {
	build: function(structure){
		if(structure.cost <= scrap.total) {
			scrap.total -= structure.cost;
			structure.isBuildable = false;
			structure.isBuilt = true;
			// Initial building integrity is a random value between max and 10 less then max, rounded down.
			structure.currentIntegrity = Math.floor(rand((structure.maxIntegrity - 10), structure.maxIntegrity)).toFixed(0)
			gameLog("Completed building " + structure.name + " with integrity of " + structure.currentIntegrity);
		} else {
			var needed = structure.cost - scrap.total;
			gameLog("Not enough scrap. Need " + needed + " more.");
		};
	},

	maintain: function(structure) {
		if(structure.isBuilt && structure.currentIntegrity < structure.maxIntegrity && scrap.total > (structure.cost / 2)) {
			scrap.total -= (structure.cost / 2);
			structure.currentIntegrity = structure.maxIntegrity;
			gameLog("Completed repairs on " + structure.name + " with integrity of " + structure.currentIntegrity);
		} else {
			var needed = (structure.cost / 2) - scrap.total;
			gameLog("Not enough scrap. Need " + needed + " more.");
		};
	},

	upgrade: function(structure, upgrade) {
		if(structure.isBuilt && structure.upgrades < structure.upgradeSlots && scrap.total >= upgrade.cost) {
			if(upgrade.type == 'storage') {
				// homeStorage.maxStorage increased by upgrade.maxStorage
				homeStorage.maxStorage.food = upgrade.maxStorage.food;
				homeStorage.maxStorage.water = upgrade.maxStorage.water;
				homeStorage.maxStorage.ammo = upgrade.maxStorage.ammo;
				homeStorage.maxStorage.scrap = upgrade.maxStorage.scrap;
				homeStorage.maxStorage.medpack = upgrade.maxStorage.medpack;
				gameLog("Built a " + upgrade.name + " in your " + structure.name);
			}
		} else {
			var needed = upgrade.cost - scrap.total;
			gameLog("Not enough scrap. Need " + needed + " more.");
		}
	}
}

// In-game log message
function gameLog(message) {
	// Check to see if the last message was the same as this one, if so just increment the (xNumber) value
	if (document.getElementById('logL').innerHTML == message) {
		logRepeat += 1;
		document.getElementById('log0').innerHTML = '<td id="logT">' + '</td><td id="logL">' + message + '</td><td id="logR">(x' + logRepeat + ')</td>';
	} else {
		// Reset the (xNumber) value
		logRepeat = 1
			// Go through all the logs in order, moving them down one and successively overwriting them.
		document.getElementById('log9').innerHTML = document.getElementById('log8').innerHTML
		document.getElementById('log8').innerHTML = document.getElementById('log7').innerHTML
		document.getElementById('log7').innerHTML = document.getElementById('log6').innerHTML
		document.getElementById('log6').innerHTML = document.getElementById('log5').innerHTML
		document.getElementById('log5').innerHTML = document.getElementById('log4').innerHTML
		document.getElementById('log4').innerHTML = document.getElementById('log3').innerHTML
		document.getElementById('log3').innerHTML = document.getElementById('log2').innerHTML
		document.getElementById('log2').innerHTML = document.getElementById('log1').innerHTML
		// Since ids need to be unique, log1 strips the ids from the log0 elements when copying the contents.
		document.getElementById('log1').innerHTML = '<td>' + document.getElementById('logT').innerHTML + '</td><td>' + document.getElementById('logL').innerHTML + '</td><td>' + document.getElementById('logR').innerHTML + '</td>';
		// Creates new contents with new message, and x1
		document.getElementById('log0').innerHTML = '<td id="logT">' + '</td><td id="logL">' + message + '</td><td id="logR">(x' + logRepeat + ')</td>';
	}
}

// Panel selection
function paneSelect(name){
	// Called when user switches between the various panes 
	if (name == 'buildings'){
		document.getElementById("buildingsPane").style.display = "block";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("storagePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector selected";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectStorage").className = "paneSelector";
	}
	if (name == 'upgrades'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "block";
		document.getElementById("storagePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector selected";
		document.getElementById("selectStorage").className = "paneSelector";
	}
	if (name == 'storage'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("storagePane").style.display = "block";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectStorage").className = "paneSelector selected";
	}
}

// Main timer function
window.setInterval(function() {
	statsLimiter();
	statusMulti();
	updateTotals();
	applyStatusEffect();
	deathCheck();
	// console.log('multi ' + (lesserMulti * greaterMulti))
}, 1000);


/*====================================================================================================*/


// Items, Upgrades, and Structures
var buildings = [
	hole = {
		'name': 'hole',
		'discription': "A modest hole.",
		'isBuildable': false,
		'cost': 40,
		'maxIntegrity': 20,
		'currentIntegrity': 0,
		'upgradeSlots': 1,
		'upgrades': 0,
		'buffs': {
			// idk yet
		},
		'isBuilt': false
	},
	shack = {
		'name': 'shack',
		'discription': "Basically a metal tent.",
		'isBuildable': false,
		'cost': 80,
		'maxIntegrity': 40,
		'currentIntegrity': 0,
		'upgradeSlots': 1,
		'upgrades': 0,
		'buffs': {
			// idk yet
		},
		'isBuilt': false
	},
	hut = {
		'name': 'hut',
		'discription': "Sturdy looking thing.",
		'isBuildable': false,
		'cost': 120,
		'maxIntegrity': 60,
		'currentIntegrity': 0,
		'upgradeSlots': 2,
		'upgrades': 0,
		'buffs': {
			// idk yet
		},
		'isBuilt': false
	}

]

var upgrades = [
	// Storage containers
	box = {
		'name': 'box',
		'discription': "A simple box to hold things.",
		'type': 'storage',
		'maxStorage': {
			'food': 10,
			'water': 10,
			'ammo': 10,
			'scrap': 10,
			'medpack': 10
		},
		'totalStorage': {
			'food': 0,
			'water': 0,
			'ammo': 0,
			'scrap': 0,
			'medpack': 0
		},
		'cost': '20'
	},
	crate = {
		'name': 'crate',
		'discription': "Larger then a box, smaller then a chest.",
		'type': 'storage',
		'maxStorage': {
			'food': 20,
			'water': 20,
			'ammo': 20,
			'scrap': 20,
			'medpack': 120
		},
		'totalStorage': {
			'food': 0,
			'water': 0,
			'ammo': 0,
			'scrap': 0,
			'medpack': 0
		},
		'cost': '50'
	},
	chest = {
		'name': 'chest',
		'discription': "Can hold a bunch of your stuff.",
		'type': 'storage',
		'maxStorage': {
			'food': 50,
			'water': 50,
			'ammo': 50,
			'scrap': 50,
			'medpack': 50
		},
		'totalStorage': {
			'food': 0,
			'water': 0,
			'ammo': 0,
			'scrap': 0,
			'medpack': 0
		},
		'cost': '100'
	}
]