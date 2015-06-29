var encounterTypes = [
	enemies = {
		'thug': {
			'name': 'thug',
			'offense': 1,
			'defense': 2,
			'chance': 0.3
		},
		'vandal': {
			'name': 'vandal',
			'offense': 2,
			'defense': 3,
			'chance': 0.3
		},
		'raider': {
			'name': 'raider',
			'offense': 3,
			'defense': 4,
			'chance': 0.2
		},
		'mercenary': {
			'name': 'mercenary',
			'offense': 4,
			'defense': 5,
			'chance': 0.2
		}
	}
]

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
	'offense': 2,
	'defense': 2,
	'armed': false,
	'dangerous': false
};

var enemiesList = [encounterTypes[0].thug, encounterTypes[0].vandal, encounterTypes[0].raider, encounterTypes[0].mercenary];
var enemiesWeight = [encounterTypes[0].thug.chance, encounterTypes[0].vandal.chance, encounterTypes[0].raider.chance, encounterTypes[0].mercenary.chance];
var inCombat = false;


// Enemy constructor
function Enemy(name, offense, defense) {
	this.name = name;
	this.type = 'hostile';
	this.health = rand(20, 100).toFixed(0);
	this.offense = offense;
	this.defense = defense;
	this.loot = {
		'food': rand(1,20).toFixed(0),
		'water': rand(1,20).toFixed(0),
		'ammo': rand(1,20).toFixed(0),
		'scrap': rand(1,30).toFixed(0),
		'medpack': rand(1,10).toFixed(0)
	};
}

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

var rand = function(min, max) {
	return Math.random() * (max - min) + min;
};


var playerAction = 'wait';
var encounter = '';
var inputTimeout = setTimeout(10000, function() {
    // This is an anonymous function that will be called when the timer goes off.
    alert('timeout')
    // Remove the answer so the user can't click it anymore, etc...
    playerAction = 'wait';
});


function newEncounter() {
	var type = weightedRand(enemiesList, enemiesWeight);
	encounter = new Enemy(type.name, type.offense, type.defense);
	document.getElementById("enemyHealth").innerHTML = encounter.health;
	document.getElementById("enemyType").innerHTML = encounter.name;
	console.log(encounter.health);
	console.log(encounter.name);
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

function fight(attacker, defender) {
	var atk = attack(attacker);
	var def = defend(defender);
	var damage = atk - def;
	if(damage < 0) {
		damage = 0;
	}

	defender.health -= damage;
	console.log('damage',damage)

	document.getElementById("enemyHealth").innerHTML = encounter.health;
	document.getElementById("yourHealth").innerHTML = player.health;
}
































// Main timer function
window.setInterval(function() {
document.getElementById("yourHealth").innerHTML = player.health;
}, 1000);