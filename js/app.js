// Survival Clicker
// An incremental game with a post apocalyptic twist
var version = 0.5;

// Initialize values
var player = {
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
	'gameOver': false,
	'currentHome': 'none',
	'offense': 0,
	'defense': 0,
	'armed': false,
	'dangerous': false
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
	chance: 0.3,
};
var rareLoot = {
	handgun: {
		'name': 'handgun',
		'offense': 2,
		'chance': 0.1
	},
	hunting: {
		'name': 'hunting rifle',
		'offense': 4,
		'chance': 0.1
	},
	assault: {
		'name': 'assault rifle',
		'offense': 8,
		'chance': 0.05
	},
	nothing: {
		'chance': 0.8
	},
	chance: 0.05,
}

var basicSupplies = [food, water, ammo, scrap, medpack, nothing, rareLoot];
var weight = [food.chance, water.chance, ammo.chance, scrap.chance, medpack.chance, nothing.chance, rareLoot.chance];
var rareList = [rareLoot.handgun, rareLoot.hunting, rareLoot.assault, rareLoot.nothing];
var rareWeight = [rareLoot.handgun.chance, rareLoot.hunting.chance, rareLoot.assault.chance, rareLoot.nothing.chance];
var inCombat = false;
var lesserMulti = 1;
var greaterMulti = 1;
var clicks = 0;
var daysSurvived = 0;
var daysSinceLastAttack = 0;
var lastAction = '';
var encounter = '';

// Generates a random number between min and max.
var rand = function(min, max) {
	return Math.random() * (max - min) + min;
};

// Broken out function for weighted-random
// It can take all of the basic supplies you might find and return
// a single random-weighted result as a loot drop. 
var weightedRand = function(list, weight) {
	var total_weight = weight.reduce(function(prev, cur, i, arr) {
		return prev + cur;
	});
	// console.log('total weight',total_weight);

	var random_num = rand(0, total_weight);
	// console.log('random num', random_num);
	var weight_sum = 0;

	for (var i = 0; i < list.length; i++) {
		weight_sum += weight[i];
		// console.log(weight[i]);
		weight_sum = +weight_sum.toFixed(2);
		// console.log('weight sum',weight_sum);
		var result = list[i];

		if (random_num <= weight_sum) {
			return list[i];
		}
	}
};

// This function is the main click action. 
var gatherSupplies = function() {
	var foundItem = weightedRand(basicSupplies, weight);
	// console.log(foundItem);
	// Rare loot will start showing up after 5 days in-game
	// so far it's just weapons that will add to your damage.
	// if you already found that weapon, or you have a better one,
	// it won't overwrite what you have
	if(foundItem == rareLoot && daysSurvived > 5) {
		var rareItem = weightedRand(rareList, rareWeight);
		// console.log(rareItem);
		if(rareItem == rareLoot.handgun && player.offense >= 0 && player.offense < 2) {
			player.offense = rareItem.offense;
			player.armed = true;
			gameLog("Found an old handgun!");
		} else if(rareItem == rareLoot.hunting && player.offense >= 0 && player.offense < 4) {
			player.offense = rareItem.offense;
			player.armed = true;
			gameLog("Found a descent looking hunting rifle!");
		} else if(rareItem == rareLoot.assault && player.armed && player.offense < 8) {
			player.offense = rareItem.offense;
			player.dangerous = true;
			gameLog("Found an assault rifle! Oh boy!");			
		} else if(rareItem == rareLoot.nothing) {
			gameLog("Found nothing")
		}
	// if < 5 days, you get some ammo instead
	} else if(foundItem == rareLoot && daysSurvived < 5) {
		console.log('rare :(');
		foundItem = ammo;
		foundItem.total++;
		gameLog("Found " + foundItem.name);
	// if not rare, regular item
	} else {
		foundItem.total++
		gameLog("Found " + foundItem.name);
	}


	// 10 clicks to a day
	daysSurvived += 0.1;
	daysSinceLastAttack += 0.1;
	clicks += 1;
	// Apply certain functions when button pressed to progress game
	updateTotals();
	applyStatusEffect();
	playerStatsRemoval();
	deathCheck();
};

// increases stats and removes health
function playerStatsRemoval() {
	player.hunger += (1 * lesserMulti * greaterMulti);
	player.thirst += (1.2 * lesserMulti * greaterMulti);
	player.rads += (1.5 * lesserMulti * greaterMulti);
	// Health removal
	if (player.hungry || player.thirsty || player.sick) {
		player.health -= (1 * lesserMulti * greaterMulti);
	}
	if (player.starving || player.dehydrated) {
		player.health -= (1 * lesserMulti * greaterMulti);
	}
}

// checks if the player is dead and kills the player if able
function deathCheck() {
	if (player.health == 0 && !player.gameOver) {
		if(homeStorage.currentStorage.medpack > (homeStorage.maxStorage.medpack / 2)) {
			alert("You manage to stumble blindly home and patch yourself up somehow. ");
			gameLog("The will to live is strong.")
			homeStorage.currentStorage.medpack = 0;
			player.health = 100;
			player.hunger = 0;
			player.thirst = 0;
			player.rads = 0;
		} else {
			alert("You have succumbed to deaths cold embrace. Your journey has ended.")
			player.gameOver = true;
			resetGame();
		}
	} 
}

// resets the game 
function resetGame() {
	gameLog("You survived " + daysSurvived.toFixed(0) + " days.");
	gameLog("You clicked " + clicks + " times.")
		player.health = 100;
		player.hunger = 0;
		player.hungry = false;
		player.starving = false;
		player.thirst = 0;
		player.thirsty = false;
		player.dehydrated = false;
		player.rads = 10;
		player.sick = false;
		player.gameOver = false;
		player.currentHome = 'none';
		homeStorage.currentStorage.food = 0;
		homeStorage.currentStorage.water = 0;
		homeStorage.currentStorage.ammo = 0;
		homeStorage.currentStorage.scrap = 0;
		homeStorage.currentStorage.medpack = 0;
		homeStorage.maxStorage.food = 0;
		homeStorage.maxStorage.water = 0;
		homeStorage.maxStorage.ammo = 0;
		homeStorage.maxStorage.scrap = 0;
		homeStorage.maxStorage.medpack = 0;
		buildings[0].isBuilt = false;
		buildings[1].isBuilt = false;
		buildings[2].isBuilt = false;
		upgrades[0].isBuilt = false;
		upgrades[1].isBuilt = false;
		upgrades[2].isBuilt = false;
		food.total = 0;
		water.total = 0;
		ammo.total = 0;
		scrap.total = 0;
		medpack.total = 0;
		daysSurvived = 0;
		clicks = 0;
		gameLog("Game reset.")
}

// updates the html with different things
function updateTotals() {
	// Supplies
	document.getElementById('food_count').innerHTML = food.total.toFixed(0);
	document.getElementById('water_count').innerHTML = water.total.toFixed(0);
	document.getElementById('ammo_count').innerHTML = ammo.total.toFixed(0);
	document.getElementById('scrap_metal_count').innerHTML = scrap.total.toFixed(0);
	document.getElementById('medical_supplies_count').innerHTML = medpack.total.toFixed(0);
	// Attributes
	document.getElementById('health_count').innerHTML = player.health.toFixed(0);
	document.getElementById('hunger_count').innerHTML = player.hunger.toFixed(0);
	document.getElementById('thirst_count').innerHTML = player.thirst.toFixed(0);
	document.getElementById('rads_count').innerHTML = player.rads.toFixed(0);
	// Days survived rounded down
	document.getElementById('days_survived_count').innerHTML = Math.floor(daysSurvived).toFixed(0);
	// Building costs and discriptions
	document.getElementById('hole_cost').innerHTML = buildings[0].cost;
	document.getElementById('hole_discription').innerHTML = buildings[0].discription;
	document.getElementById('shack_cost').innerHTML = buildings[1].cost;
	document.getElementById('shack_discription').innerHTML = buildings[1].discription;
	document.getElementById('hut_cost').innerHTML = buildings[2].cost;
	document.getElementById('hut_discription').innerHTML = buildings[2].discription;
	// Upgrade costs and discriptions
	document.getElementById('box_cost').innerHTML = upgrades[0].cost;
	document.getElementById('box_discription').innerHTML = upgrades[0].discription;
	document.getElementById('crate_cost').innerHTML = upgrades[1].cost;
	document.getElementById('crate_discription').innerHTML = upgrades[1].discription;
	document.getElementById('chest_cost').innerHTML = upgrades[2].cost;
	document.getElementById('chest_discription').innerHTML = upgrades[2].discription;
	// Current home
	if(player.currentHome.name != undefined) {
		document.getElementById('current_home').innerHTML = player.currentHome.name;
		document.getElementById('current_integrity').innerHTML = player.currentHome.currentIntegrity;
		document.getElementById('max_integrity').innerHTML = player.currentHome.maxIntegrity;
		if(player.currentHome.currentIntegrity < player.currentHome.maxIntegrity) {
			document.getElementById('repair_integrity').className = "button";
		} else {
			document.getElementById('repair_integrity').className = "hidden";
		}
	} else {
		document.getElementById('current_home').innerHTML = 'none';
		document.getElementById('current_integrity').innerHTML = 0;
		document.getElementById('max_integrity').innerHTML = 0;
	}
	// Storage counts
	document.getElementById('current_food').innerHTML = homeStorage.currentStorage.food;
	document.getElementById('max_food').innerHTML = homeStorage.maxStorage.food;
	document.getElementById('current_water').innerHTML = homeStorage.currentStorage.water;
	document.getElementById('max_water').innerHTML = homeStorage.maxStorage.water;
	document.getElementById('current_ammo').innerHTML = homeStorage.currentStorage.ammo;
	document.getElementById('max_ammo').innerHTML = homeStorage.maxStorage.ammo;
	document.getElementById('current_scrap').innerHTML = homeStorage.currentStorage.scrap;
	document.getElementById('max_scrap').innerHTML = homeStorage.maxStorage.scrap;
	document.getElementById('current_medpack').innerHTML = homeStorage.currentStorage.medpack;
	document.getElementById('max_medpack').innerHTML = homeStorage.maxStorage.medpack;
};

// Upper and lower limits on things
function statsLimiter() {
	// Player stats limiter
	if (player.health >= 100) {
		player.health = 100;
	}
	if (player.hunger >= 100) {
		player.hunger = 100;
	}
	if (player.thirst >= 100) {
		player.thirst = 100;
	}
	if (player.rads >= 200) {
		player.rads = 200;
	}
	if (player.health <= 0) {
		player.health = 0;
	}
	if (player.hunger <= 0) {
		player.hunger = 0;
	}
	if (player.thirst <= 0) {
		player.thirst = 0;
	}
	if (player.rads <= 0) {
		player.rads = 0;
	}
}

// checks player stats and applies status effects to the player
function applyStatusEffect() {
	// Hunger
	if (player.hunger < 60) {
		player.hungry = false;
		player.starving = false;
	} else if ((player.hunger >= 60 && player.hunger < 100) && !player.starving) {
		player.hungry = true;
		gameLog("You are hungry");
	} else if (player.hunger >= 100) {
		player.hungry = false;
		player.starving = true;
		gameLog("You are starving");
	};
	// Thirst
	if (player.thirst < 60) {
		player.thirsty = false;
		player.dehydrated = false;
	} else if ((player.thirst >= 60 && player.thirst < 100) && !player.dehydrated) {
		player.thirsty = true;
		gameLog("You are thirsty");
	} else if (player.thirst >= 100) {
		player.thirsty = false;
		player.dehydrated = true;
		gameLog("You are dehydrated");
	};
	// Rad sickness
	if (player.rads < 100) {
		player.sick = false;
	} else if (player.rads >= 100 && player.rads < 200) {
		player.sick = true;
		gameLog("You have radiation sickness");
	} else if (player.rads == 200) {
		player.health = 0;
	};
};

// Checks player condition and applies status modification
function statusMulti() {
	// Status multiplier
	// Lesser status effects
	// If none or one 
	if (!player.hungry && !player.thirsty && !player.sick) {
		lesserMulti = 1.0;
	}
	if (player.hungry || player.thirsty || player.sick) {
		lesserMulti = 1.5;
	};
	// If any two
	if (player.hungry && player.thirsty) {
		lesserMulti = 3.0;
	} else if (player.hungry && player.sick) {
		lesserMulti = 3.0;
	} else if (player.thirsty && player.sick) {
		lesserMulti = 3.0;
	};
	// If three
	if (player.hungry && player.thirsty && player.sick) {
		lesserMulti = 4.5;
	};

	// Greater status effects
	// If one or none
	if (!player.starving && !player.dehydrated) {
		greaterMulti = 1.0;
	}
	if (player.starving || player.dehydrated) {
		greaterMulti = 2.0;
	}
	// If both
	if (player.starving && player.dehydrated) {
		greaterMulti = 4.0;
	}

	// Display to player
	// Hunger
	if (player.hungry) {
		document.getElementById('hungry_status').className = "hungry_status";
		document.getElementById('starving_status').className += " hidden";
	} else if (player.starving) {
		document.getElementById('starving_status').className = "starving_status";
		document.getElementById('hungry_status').className += " hidden";
	} else {
		document.getElementById('hungry_status').className += " hidden";
		document.getElementById('starving_status').className += " hidden";
	};
	// Thirst
	if (player.thirsty) {
		document.getElementById('thirsty_status').className = "thirsty_status";
		document.getElementById('dehydrated_status').className += " hidden";
	} else if (player.dehydrated) {
		document.getElementById('dehydrated_status').className = "dehydrated_status";
		document.getElementById('thirsty_status').className += " hidden";
	} else {
		document.getElementById('thirsty_status').className += " hidden";
		document.getElementById('dehydrated_status').className += " hidden";
	};
	// Rad sickness
	if (player.sick) {
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
			player.health += 20;
			player.rads -= 20;
		} else if (item.name == 'food') {
			player.hunger -= 10;
		} else if (item.name == 'water') {
			player.thirst -= 12;
		}
	} else {
		gameLog('Not enough ' + item.name);
	}
}

// Build, maintain, and upgrade structures
// also item storage
var shelter = {
	build: function(structure){
		if(structure.isBuilt) {
			gameLog("You already built a " + structure.name);
		} else if(structure.cost <= scrap.total) {
			scrap.total -= structure.cost;
			structure.isBuilt = true;
			player.currentHome = structure;
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
		if(structure.isBuilt && upgrade.isBuilt) {
			gameLog("You already built a " + upgrade.name)
		} else if(structure.isBuilt && structure.upgrades < structure.upgradeSlots && scrap.total >= upgrade.cost) {
			if(upgrade.type == 'storage') {
				scrap.total -= structure.cost;
				// homeStorage.maxStorage increased by upgrade.maxStorage
				upgrade.isBuilt = true;
				homeStorage.maxStorage.food = upgrade.maxStorage.food;
				homeStorage.maxStorage.water = upgrade.maxStorage.water;
				homeStorage.maxStorage.ammo = upgrade.maxStorage.ammo;
				homeStorage.maxStorage.scrap = upgrade.maxStorage.scrap;
				homeStorage.maxStorage.medpack = upgrade.maxStorage.medpack;
				gameLog("Built a " + upgrade.name + " in your " + structure.name);
			} else {
				var needed = upgrade.cost - scrap.total;
				gameLog("Not enough scrap. Need " + needed + " more.");
			}
		}
	},

	store: function(item) {
		if(item.total == 0) {
			gameLog("Not enough " + item.name);
		} else if(homeStorage.currentStorage[item.name] < homeStorage.maxStorage[item.name] && item.total > 0) {
			item.total -= 1;
			homeStorage.currentStorage[item.name] += 1;
			gameLog("Stored 1 " + item.name);
		} else {
			gameLog(item.name + " storage at capacity.");
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
		document.getElementById("homePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector selected";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectHome").className = "paneSelector";
	}
	if (name == 'upgrades'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "block";
		document.getElementById("homePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector selected";
		document.getElementById("selectHome").className = "paneSelector";
	}
	if (name == 'home'){
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("homePane").style.display = "block";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectHome").className = "paneSelector selected";
	}
}

// Main timer function
window.setInterval(function() {
	statsLimiter();
	statusMulti();
	updateTotals();
	applyStatusEffect();
	deathCheck();
	combat();
	// heal();
}, 1000);


/*====================================================================================================*/
// Enemies and combat

// enemy types
var encounterTypes = [
	enemies = {
		'thug': {
			'name': 'Thug',
			'offense': 1.0,
			'defense': 1.5,
			'chance': 0.3
		},
		'vandal': {
			'name': 'Vandal',
			'offense': 1.5,
			'defense': 1.5,
			'chance': 0.3
		},
		'raider': {
			'name': 'Raider',
			'offense': 2.0,
			'defense': 3.0,
			'chance': 0.2
		},
		'mercenary': {
			'name': 'Mercenary',
			'offense': 4.0,
			'defense': 5.0,
			'chance': 0.2
		}
	}
]


var enemiesList = [encounterTypes[0].thug, encounterTypes[0].vandal, encounterTypes[0].raider, encounterTypes[0].mercenary];
var enemiesWeight = [encounterTypes[0].thug.chance, encounterTypes[0].vandal.chance, encounterTypes[0].raider.chance, encounterTypes[0].mercenary.chance];

// Enemy constructor
function Enemy(name, offense, defense) {
	this.name = name;
	this.type = 'hostile';
	this.offense = offense;
	this.defense = defense;
	if(offense < 2) {
		this.health = rand(20, 50).toFixed(0);
		this.loot = {
			'food': rand(1,10),
			'water': rand(1,10),
			'ammo': rand(1,10),
			'scrap': rand(1,10),
			'medpack': rand(1,10)
		}
	} else if(offense < 3) {
		this.health = rand(20, 70).toFixed(0);
		this.loot = {
			'food': rand(1,20),
			'water': rand(1,20),
			'ammo': rand(1,20),
			'scrap': rand(1,20),
			'medpack': rand(1,20)
		}
	} else if(offense < 5) {
		this.health = rand(20, 100).toFixed(0);
		this.loot = {
			'food': rand(1,30),
			'water': rand(1,30),
			'ammo': rand(1,30),
			'scrap': rand(1,30),
			'medpack': rand(1,30)
		}
	}
}

// generates new encounter and puts game into combat state
function newEncounter() {
	var type = weightedRand(enemiesList, enemiesWeight);
	// won't generate merc if you haven't found the assault rifle cause he's tough
	if(type.name == 'Mercenary' && !player.dangerous) {
		type = weightedRand(enemiesList, enemiesWeight);
	}
	encounter = new Enemy(type.name, type.offense, type.defense);
	document.getElementById("enemyHealth").innerHTML = encounter.health;
	document.getElementById("enemyType").innerHTML = encounter.name;
	inCombat = true;
	return encounter;
}

function attack(attacker) {
	var damage = attacker.offense * rand(2,5);
	console.log('attack',damage);
	return damage.toFixed(0);
}

function defend(defender) {
	var block = defender.defense * rand(1,5);
	console.log('block',block);
	return block.toFixed(0);
}

function run() {
	lastAction = 'run';
	if(player.health >= encounter.health) {
		inCombat = false;
		gameLog("You booked it and ran away from that " + encounter.name);
		daysSinceLastAttack = 0;
	} else {
		gameLog("You tried to run but the " + encounter.name + " gave chase!");
	}
}

// takes attack() and defend() as arguments and dukes them out
function fight(attacker, defender) {
	var atk = attack(attacker);
	var def = defend(defender);
	var damage = atk - def;
	if(damage < 0) {
		damage = 0;
	}

	defender.health -= damage;
	gameLog(attacker.name + " shot " + defender.name + " for " + damage + "!");
	document.getElementById("enemyHealth").innerHTML = encounter.health;
}

function combat() {
	// generate a new encounter at random
	if(player.armed && !inCombat && daysSinceLastAttack > 6) {
		var x = rand(1,1000)
		console.log(x);
		if(x > 700) {
			newEncounter();
			daysSinceLastAttack = 0;
			gameLog("A " + encounter.name + " attacks you!");
		}
	}

	if(lastAction == 'attack' && inCombat) {
		if(ammo.total > 0) {
			fight(player, encounter);
			ammo.total -= 1;
		} else {
			gameLog("Out of ammo!");
		}

	}

	// encounter attacks player
	if((lastAction == 'attack' || lastAction == 'run') && inCombat) {
		fight(encounter, player);
		lastAction = 'wait';
	}
	
	// when enemy dies, reset encounter, and add loot to inventory.
	if(encounter.health <= 0) {
		inCombat = false;
		food.total += encounter.loot.food;
		water.total += encounter.loot.water;
		ammo.total += encounter.loot.ammo;
		scrap.total += encounter.loot.scrap;
		medpack.total += encounter.loot.medpack;
		gameLog(encounter.loot.food.toFixed(0) + " food, " + encounter.loot.water.toFixed(0) + " water, " + encounter.loot.ammo.toFixed(0) + " ammo, " + encounter.loot.scrap.toFixed(0) + " scrap, and " + encounter.loot.medpack.toFixed(0) + " medpacks.");
		gameLog("Found some items on the dead body:");
		encounter = '';
	}

	if(inCombat) {
		// reveal combat controls and disable gather button
		document.getElementById('combat_area').className = " ";
		document.getElementById('gather_button').disabled = true; 
	} else {
		document.getElementById('combat_area').className = "hidden";
		document.getElementById('gather_button').disabled = false;
	}
}


/*====================================================================================================*/


// Items, Upgrades, and Structures
var buildings = [
	hole = {
		'name': 'hole',
		'discription': "A modest hole.",
		'isBuildable': false,
		'cost': 20,
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
		'cost': 40,
		'maxIntegrity': 30,
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
		'cost': 60,
		'maxIntegrity': 50,
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
		'cost': 20,
		'isBuilt': false
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
			'medpack': 20
		},
		'cost': 30,
		'isBuilt': false
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
		'cost': 60,
		'isBuilt': false
	},
]




/* debug & testing */
function heal() {
	player.health = 100;
	player.hunger = 0;
	player.thirst = 0;
	player.rads = 0;
}