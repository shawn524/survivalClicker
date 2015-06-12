// Survival Clicker
// An incremental game with a post apocalyptic twist
var version = 0.3;

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
	'sick': false
}
var food = {
	name:'food',
	total:0,
	increment:1,
	chance:0.2
};
var water = {
	name:'water',
	total:0,
	increment:1,
	chance:0.3
};
var ammo = {
	name:'ammo',
	total:0,
	increment:1,
	chance:0.2
};
var scrap = {
	name:'scrap',
	total:0,
	increment:1,
	chance:0.2
};
var medpack = {
	name:'medpack',
	total:0,
	increment:1,
	chance:0.1
};

var basicSupplies = [food, water, ammo, scrap, medpack];
var weight = [food.chance, water.chance, ammo.chance, scrap.chance, medpack.chance];
var statusMultiplier = 1;

// Generates a random number between min and max.
var rand = function(min, max) {
    return Math.random() * (max - min) + min;
};
 
// This function is the main click action. 
// It can take all of the basic supplies you might find and return
// a single random-weighted result as a loot drop. 
var gatherSupplies = function(basicSupplies, weight) {
    var total_weight = weight.reduce(function (prev, cur, i, arr) {
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
            console.log('found some',basicSupplies[i].name);
            break;
        }
    }
    updateTotals();
    updatePlayerStatus();
};

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

};

function updatePlayerStatus() {
	// Hunger
	if(playerAttributes.hunger < 60) {
		playerAttributes.hungry = false;
		// playerAttributes.hunger += (1 * statusMultiplier);
	} else if(playerAttributes.hunger >= 60 && playerAttributes.hunger < 100){
		playerAttributes.hungry = true;
		playerAttributes.starving = false;
		// playerAttributes.hunger += (1 * statusMultiplier);
	} else if(playerAttributes.hunger >= 100) {
		playerAttributes.hungry = false;
		playerAttributes.starving = true;
	}
	// Thirst
	if(playerAttributes.thirst < 60) {
		playerAttributes.thirsty = false;
		// playerAttributes.thirst += (1 * statusMultiplier);
	} else if(playerAttributes.thirst >= 60 && playerAttributes.thirst < 100){
		playerAttributes.thirsty = true;
		playerAttributes.dehydrated = false;
		// playerAttributes.thirst += (1 * statusMultiplier);
	} else if(playerAttributes.thirst >= 100) {
		playerAttributes.thirsty = false;
		playerAttributes.dehydrated = true;
	}
	// Rad sickness
	if(playerAttributes.rads < 100) {
		playerAttributes.sick = false;
		// playerAttributes.rads += (1 * statusMultiplier);
	} else if(playerAttributes.rads >= 100){
		playerAttributes.sick = true;
		// playerAttributes.rads += (1 * statusMultiplier);
	} else if(playerAttributes.rads == 200) {
		// Kill player
	}
}

// Checks player condition and applies status modification
function statusMultiplierFunc() {
	// Status multiplier
	// Lesser status effects
	// If none or one 
	if(!playerAttributes.hungry && !playerAttributes.thirsty && !playerAttributes.sick) {
		statusMultiplier = 1.0;
	}
	if(playerAttributes.hungry || playerAttributes.thirsty || playerAttributes.sick) {
		statusMultiplier = 1.5;
	};
	// If any two
	if(playerAttributes.hungry && playerAttributes.thirsty) {
		statusMultiplier = 3.0;
	} else if(playerAttributes.hungry && playerAttributes.sick){
		statusMultiplier = 3.0;
	} else if(playerAttributes.thirsty && playerAttributes.sick){
		statusMultiplier = 3.0;
	};
	// If three
	if(playerAttributes.hungry && playerAttributes.thirsty && playerAttributes.sick) {
		statusMultiplier = 4.5;
	};

	// Display to player
	// Hunger
	if(playerAttributes.hungry) {
		document.getElementById('hungry_status').className = "hungry_status";
		document.getElementById('starving_status').className += " hidden";
	} else if(playerAttributes.starving) {
		document.getElementById('starving_status').className = "starving_status";
		document.getElementById('hungry_status').className += " hidden";
	} else {
		document.getElementById('hungry_status').className += " hidden";
		document.getElementById('starving_status').className += " hidden";
	};
	// Thirst
	if(playerAttributes.thirsty) {
		document.getElementById('thirsty_status').className = "thirsty_status";
		document.getElementById('dehydrated_status').className += " hidden";
	} else if(playerAttributes.dehydrated) {
		document.getElementById('dehydrated_status').className = "dehydrated_status";
		document.getElementById('thirsty_status').className += " hidden";
	} else {
		document.getElementById('thirsty_status').className += " hidden";
		document.getElementById('dehydrated_status').className += " hidden";
	};
	// Rad sickness
	if(playerAttributes.sick) {
		document.getElementById('sick_status').className = "sick_status";
	} else {
		document.getElementById('sick_status').className += " hidden";
	};
}

function useItem(item) {
	if(item.total > 0) {
		item.total -= 1;
		if(item.name == 'medpack') {
			playerAttributes.health += 20;
			playerAttributes.rads -= 20;
		} else if(item.name == 'food') {
			playerAttributes.hunger -= 10;
		} else if(item.name == 'water') {
			playerAttributes.thirst -= 12;
		}
	} else {
		console.log('Not enough', item.name);
	}
}


// Main timer function
window.setInterval(function(){
	statusMultiplierFunc()
	updateTotals();
	console.log('multi', statusMultiplier)
	// updatePlayerStatus();
}, 1000);