// Survival Clicker
// An incremental game with a post apocalyptic twist
var version = 0.6;

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
var loot = [
	{
		name: 'food',
		type: 'basic',
		total: 0,
		chance: 0.1
	},
	{
		name: 'water',
		type: 'basic',
		total: 0,
		chance: 0.2
	},
	{
		name: 'ammo',
		type: 'basic',
		total: 0,
		chance: 0.1
	},
	{
		name: 'scrap',
		type: 'basic',
		total: 0,
		chance: 0.2
	},
	{
		name: 'medpack',
		type: 'basic',
		total: 0,
		chance: 0.1
	},
	{
		name: 'nothing',
		type: 'basic',
		chance: 0.3,
	},
	{
		name: 'rareLoot',
		type: 'basic',
		chance: 0.05
	},
	{
		name: 'handgun',
		type: 'rare',
		offense: 4,
		chance: 0.2
	},
	{
		name: 'hunting rifle',
		type: 'rare',
		offense: 6,
		chance: 0.1
	},
	{
		name: 'assault rifle',
		type: 'rare',
		offense: 10,
		chance: 0.05
	},
	{
		name: 'leather armor',
		type: 'rare',
		defense: 3,
		chance: 0.2
	},
	{
		name: 'bulletproof vest',
		type: 'rare',
		defense: 5,
		chance: 0.1
	},
	{
		name: 'metal armor',
		type: 'rare',
		defense: 9,
		chance: 0.05
	},
	{
		name: 'nothing',
		type: 'rare',
		chance: 0.8
	},
]

/*====================================================================================================*/
// function to build the array's used by weightedRand()
// uses MAP and FILTER
function buildWeight(arr, quality, value) {
	if(quality != undefined) {
		return arr.filter(function(x) {
			return x.type === quality;
		}).map(function(list) {
			if(value === 'name') {
				return list.name;
			} else if(value === 'chance') {
				return list.chance;
			} else {
				return list;
			}
		})
	} else {
		if(value === 'name') {
			return arr.map(function(list) {
				return list.name
			})
		} else if(value === 'chance') {
			return arr.map(function(list) {
				return list.chance
			})
		}
	}
}
/*====================================================================================================*/
var basicList = 	buildWeight(loot, 'basic', '')
var basicWeight = 	buildWeight(loot, 'basic', 'chance');
var rareList =		buildWeight(loot, 'rare', '')
var rareWeight = 	buildWeight(loot, 'rare', 'chance');
var inCombat = false;
var lesserMulti = 1;
var greaterMulti = 1;
var clicks = 0;
var daysSurvived = 0;
var daysSinceLastAttack = 0;
var lastAction = '';
var encounter = '';

// Asks the player for a name
player.name = prompt('What is your name', 'Pip')
// game intro and some instruction
gameLog("<strong>Good luck!</strong>")
gameLog("Basically just click the big button and then sometimes the little ones.")
gameLog("Beware of the dangers lurking in the shadows.")
gameLog("You will find many things to help you along the way.")
gameLog("for as long as possible.")
gameLog("The (current) goal of the game is to survive")

// Generates a random number between min and max.
var rand = function(min, max) {
	return Math.random() * (max - min) + min;
};

// Broken out function for weighted-random
// It takes two arrays. One a list of things, and the other their given chance.
// It returns a single entry from the list based on the weight and the random number that was generated
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
	var foundItem = weightedRand(basicList, basicWeight);
	console.log(foundItem);
	// Rare loot will start showing up after 5 days in-game
	// if you already found that item, or you have a better one,
	// it won't overwrite what you have
	if (foundItem.name == 'rareLoot' && daysSurvived > 5) {
		var rareItem = weightedRand(rareList, rareWeight);
		console.log(rareItem);
		if (rareItem == rareList[0] && player.offense >= 0 && player.offense < 2) {
			player.offense = rareItem.offense;
			player.armed = true;
			gameLog("<strong>Found an old handgun!</strong>");
		} else if (rareItem == rareList[1] && player.offense >= 0 && player.offense < 4) {
			player.offense = rareItem.offense;
			player.armed = true;
			gameLog("<strong>Found a decent looking hunting rifle!</strong>");
		} else if (rareItem == rareList[2] && player.armed && player.offense < 8) {
			player.offense = rareItem.offense;
			player.dangerous = true;
			gameLog("<strong>Found an assault rifle! Oh boy!</strong>");
		} else if (rareItem == rareList[3] && player.defense >= 0 && player.defense < 2) {
			player.defense = rareItem.defense;
			gameLog("<strong>Found some old leather armor.</strong>")
		} else if (rareItem == rareList[4] && player.defense >= 0 && player.defense < 5) {
			player.defense = rareItem.defense;
			gameLog("<strong>Found a bulletproof vest.</strong>")
		} else if (rareItem == rareList[5] && player.defense >= 0 && player.defense < 10) {
			player.defense = rareItem.defense;
			gameLog("<strong>Found some shiny metal armor. Enemies beware!</strong>")
		} else if (rareItem == rareList[6]) {
			gameLog("Found nothing")
		}
		// if < 5 days, you get some ammo instead
	} else if (foundItem.name == 'rareLoot' && daysSurvived < 5) {
		console.log(':(');
		foundItem = basicLoot[2];
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
		if (homeStorage.currentStorage.medpack > (homeStorage.maxStorage.medpack / 2)) {
			alert("You manage to stumble blindly home and patch yourself up somehow. ");
			gameLog("<strong>The will to live is strong.</strong>")
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
	gameLog("<em>You survived " + daysSurvived.toFixed(0) + " days.</em>");
	gameLog("<em>You clicked " + clicks + " times.</em>")
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
	player.offense = 0;
	player.defense = 0;
	player.armed = false;
	player.dangerous = false;
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
	loot[0].total = 0;
	loot[1].total = 0;
	loot[2].total = 0;
	loot[3].total = 0;
	loot[4].total = 0;
	daysSurvived = 0;
	daysSinceLastAttack = 0;
	inCombat = false;
	lastAction = 'wait';
	clicks = 0;
	gameLog("<strong>Game reset.</strong>")
}

// updates the html with different things
function updateTotals() {
	document.getElementById('player_name').innerHTML = player.name;
	// Supplies
	document.getElementById('food_count').innerHTML = loot[0].total.toFixed(0);
	document.getElementById('water_count').innerHTML = loot[1].total.toFixed(0);
	document.getElementById('ammo_count').innerHTML = loot[2].total.toFixed(0);
	document.getElementById('scrap_metal_count').innerHTML = loot[3].total.toFixed(0);
	document.getElementById('medical_supplies_count').innerHTML = loot[4].total.toFixed(0);
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
	if (player.currentHome.name != undefined) {
		document.getElementById('current_home').innerHTML = player.currentHome.name;
		document.getElementById('current_integrity').innerHTML = player.currentHome.currentIntegrity;
		document.getElementById('max_integrity').innerHTML = player.currentHome.maxIntegrity;
		if (player.currentHome.currentIntegrity < player.currentHome.maxIntegrity) {
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
		document.getElementById('hungry_status').className = "status";
		document.getElementById('starving_status').className += " hidden";
	} else if (player.starving) {
		document.getElementById('starving_status').className = "status";
		document.getElementById('hungry_status').className += " hidden";
	} else {
		document.getElementById('hungry_status').className += " hidden";
		document.getElementById('starving_status').className += " hidden";
	};
	// Thirst
	if (player.thirsty) {
		document.getElementById('thirsty_status').className = "status";
		document.getElementById('dehydrated_status').className += " hidden";
	} else if (player.dehydrated) {
		document.getElementById('dehydrated_status').className = "status";
		document.getElementById('thirsty_status').className += " hidden";
	} else {
		document.getElementById('thirsty_status').className += " hidden";
		document.getElementById('dehydrated_status').className += " hidden";
	};
	// Rad sickness
	if (player.sick) {
		document.getElementById('sick_status').className = "status";
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
	build: function(structure) {
		if (structure.isBuilt) {
			gameLog("You already built a " + structure.name);
		} else if (structure.cost <= loot[3].total) {
			loot[3].total -= structure.cost;
			structure.isBuilt = true;
			player.currentHome = structure;
			// Initial building integrity is a random value between max and 10 less then max, rounded down.
			structure.currentIntegrity = Math.floor(rand((structure.maxIntegrity - 10), structure.maxIntegrity)).toFixed(0)
			gameLog("Completed building " + structure.name + " with integrity of " + structure.currentIntegrity);
		} else {
			var needed = structure.cost - loot[3].total;
			gameLog("Not enough scrap. Need " + needed + " more.");
		};
	},

	maintain: function(structure) {
		if (structure.isBuilt && structure.currentIntegrity < structure.maxIntegrity && loot[3].total > (structure.cost / 2)) {
			loot[3].total -= (structure.cost / 2);
			structure.currentIntegrity = structure.maxIntegrity;
			gameLog("Completed repairs on " + structure.name + " with integrity of " + structure.currentIntegrity);
		} else {
			var needed = (structure.cost / 2) - loot[3].total;
			gameLog("Not enough scrap. Need " + needed + " more.");
		};
	},

	upgrade: function(structure, upgrade) {
		if (structure.isBuilt && upgrade.isBuilt) {
			gameLog("You already built a " + upgrade.name)
		} else if (structure.isBuilt && structure.upgrades < structure.upgradeSlots && loot[3].total >= upgrade.cost) {
			if (upgrade.type == 'storage') {
				loot[3].total -= structure.cost;
				// homeStorage.maxStorage increased by upgrade.maxStorage
				upgrade.isBuilt = true;
				homeStorage.maxStorage.food = upgrade.maxStorage.food;
				homeStorage.maxStorage.water = upgrade.maxStorage.water;
				homeStorage.maxStorage.ammo = upgrade.maxStorage.ammo;
				homeStorage.maxStorage.scrap = upgrade.maxStorage.scrap;
				homeStorage.maxStorage.medpack = upgrade.maxStorage.medpack;
				gameLog("Built a " + upgrade.name + " in your " + structure.name);
			} else {
				var needed = upgrade.cost - loot[3].total;
				gameLog("Not enough scrap. Need " + needed + " more.");
			}
		}
	},

	store: function(item) {
		if (item.total == 0) {
			gameLog("Not enough " + item.name);
		} else if (homeStorage.currentStorage[item.name] < homeStorage.maxStorage[item.name] && item.total > 0) {
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
	if (document.getElementById('logS').innerHTML == message) {
		logRepeat += 1;
		document.getElementById('log0').innerHTML = '<td id="logM">' + '</td><td id="logS">' + message + '</td><td id="logG">(x' + logRepeat + ')</td>';
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
		// log1 strips the ids from the log0 elements when copying the contents.
		document.getElementById('log1').innerHTML = '<td>' + document.getElementById('logM').innerHTML + '</td><td>' + document.getElementById('logS').innerHTML + '</td><td>' + document.getElementById('logG').innerHTML + '</td>';
		// Creates new contents with new message, and x1
		document.getElementById('log0').innerHTML = '<td id="logM">' + '</td><td id="logS">' + message + '</td><td id="logG">(x' + logRepeat + ')</td>';
	}
}

// Panel selection
function paneSelect(name) {
	// Called when user switches between the various panes 
	if (name == 'buildings') {
		document.getElementById("buildingsPane").style.display = "block";
		document.getElementById("upgradesPane").style.display = "none";
		document.getElementById("homePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector selected";
		document.getElementById("selectUpgrades").className = "paneSelector";
		document.getElementById("selectHome").className = "paneSelector";
	}
	if (name == 'upgrades') {
		document.getElementById("buildingsPane").style.display = "none";
		document.getElementById("upgradesPane").style.display = "block";
		document.getElementById("homePane").style.display = "none";
		document.getElementById("selectBuildings").className = "paneSelector";
		document.getElementById("selectUpgrades").className = "paneSelector selected";
		document.getElementById("selectHome").className = "paneSelector";
	}
	if (name == 'home') {
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
var enemies = [
		{
			name: 'Thug',
			offense: 4.0,
			defense: 2.0,
			chance: 0.3
		},
		{
			name: 'Vandal',
			offense: 6.5,
			defense: 4.5,
			chance: 0.3
		},
		{
			name: 'Raider',
			offense: 8.0,
			defense: 6.0,
			chance: 0.2
		},
		{
			name: 'Mercenary',
			offense: 10.0,
			defense: 9.0,
			chance: 0.2
		}
]


// var enemiesList = [enemies[0].thug, enemies[0].vandal, enemies[0].raider, enemies[0].mercenary];
var enemiesWeight = buildWeight(enemies, undefined, 'chance');

// Enemy constructor
function Enemy(name, offense, defense) {
	this.name = name;
	this.type = 'hostile';
	this.offense = offense;
	this.defense = defense;
	if (offense <= 4) {
		this.health = rand(20, 50).toFixed(0);
		this.loot = {
			'food': rand(1, 10),
			'water': rand(1, 10),
			'ammo': rand(1, 10),
			'scrap': rand(1, 10),
			'medpack': rand(1, 10)
		}
	} else if (offense <= 8) {
		this.health = rand(30, 70).toFixed(0);
		this.loot = {
			'food': rand(1, 20),
			'water': rand(1, 20),
			'ammo': rand(1, 20),
			'scrap': rand(1, 20),
			'medpack': rand(1, 20)
		}
	} else if (offense <= 10) {
		this.health = rand(50, 100).toFixed(0);
		this.loot = {
			'food': rand(1, 30),
			'water': rand(1, 30),
			'ammo': rand(1, 30),
			'scrap': rand(1, 30),
			'medpack': rand(1, 30)
		}
	}
}

// generates new encounter and puts game into combat state
function newEncounter() {
	var type = weightedRand(enemies, enemiesWeight);
	// won't generate merc if you haven't found the assault rifle cause he's tough
	if (type.name == 'Mercenary' && !player.dangerous) {
		type = weightedRand(enemies, enemiesWeight);
	}
	encounter = new Enemy(type.name, type.offense, type.defense);
	document.getElementById("enemyHealth").innerHTML = encounter.health;
	document.getElementById("enemyType").innerHTML = encounter.name;
	inCombat = true;
	return encounter;
}

function run() {
	lastAction = 'run';
	var success = rand(1, 100)
	if (success >= 70) {
		inCombat = false;
		gameLog("<em>You booked it and ran away from that " + encounter.name + "!</em>");
		daysSinceLastAttack = 0;
	} else {
		gameLog("<em>You tried to run but the " + encounter.name + " gave chase!</em>");
	}
}

function fight(attacker,defender) {
	var attack = function(attacker) {
		return (attacker.offense * rand(2,5)).toFixed(0);
	};
	var defend = function(defender) {
		return (defender.defense * rand(1,5)).toFixed(0);
	};
	var damage = attack(attacker) - defend(defender);
	if(damage < 0) {
		damage = 0;
	}
	defender.health -= damage;
	gameLog("<strong>" + attacker.name + " shot " + defender.name + " for " + damage + "!</strong>");
	document.getElementById("enemyHealth").innerHTML = encounter.health;
}

// the main combat function that runs on the timer
// checks certain conditions and if met, puts player into combat state
// also handles the enemy attacks and death
function combat() {
	// generate a new encounter at random
	if (player.armed && !inCombat && daysSinceLastAttack > 6) {
		var x = rand(1, 1000)
		// console.log(x);
		if (x > 700) {
			newEncounter();
			daysSinceLastAttack = 0;
			lastAction = 'wait';
			gameLog("<em>A " + encounter.name + " attacks you!</em>");
		}
	}

	// player attacks encounter
	if (lastAction == 'attack' && inCombat) {
		if (loot[2].total > 0) {
			fight(player, encounter);
			useItem(loot[2]);
		} else {
			gameLog("<em>Out of ammo!</em>");
		}
	}

	// encounter attacks player
	if ((lastAction == 'attack' || lastAction == 'run') && inCombat) {
		fight(encounter, player);
		lastAction = 'wait';
	}

	// when enemy dies, reset encounter, and add loot to inventory.
	if (encounter.health <= 0) {
		inCombat = false;
		loot[0].total += encounter.loot.food;
		loot[1].total += encounter.loot.water;
		loot[2].total += encounter.loot.ammo;
		loot[3].total += encounter.loot.scrap;
		loot[4].total += encounter.loot.medpack;
		gameLog(encounter.loot.food.toFixed(0) + " food, " + encounter.loot.water.toFixed(0) + " water, " + encounter.loot.ammo.toFixed(0) + " ammo, " + encounter.loot.scrap.toFixed(0) + " scrap, and " + encounter.loot.medpack.toFixed(0) + " medpacks.");
		gameLog("<em>Found some items on the dead body:</em>");
		gameLog("<strong>Killed the " + encounter.name + "!</strong>")
		encounter = '';
	}

	// reveal combat controls and disable gather button
	if (inCombat) {
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

function arm(lvl) {
	loot[2].total = 100;
	if(lvl == 1) {
		player.offense = rareList[0].offense;
		player.defense = rareList[3].defense;
	}
	if(lvl == 2) {
		player.offense = rareList[1].offense;
		player.defense = rareList[4].defense;
	}
	if(lvl == 3) {
		player.offense = rareList[2].offense;
		player.defense = rareList[5].defense;
	}
}