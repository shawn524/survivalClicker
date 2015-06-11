// Survival Clicker
// An incremental game with a post apocalyptic twist
var version = 0.1;

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
var scrapMetal = {
	name:'scrap metal',
	total:0,
	increment:1,
	chance:0.2
};
var medicalSupplies = {
	name:'medical supplies',
	total:0,
	increment:1,
	chance:0.1
};

var basicSupplies = [food, water, ammo, scrapMetal, medicalSupplies];
var weight = [food.chance, water.chance, ammo.chance, scrapMetal.chance, medicalSupplies.chance];
var statusMultiplier = 1;

var rand = function(min, max) {
    return Math.random() * (max - min) + min;
};
 
// This function is the main click action. 
// It can take all of the basic supplies you might find and return
// a single random-weighted result as a loot drop. 
var forage = function(basicSupplies, weight) {
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
	document.getElementById('scrap_metal_count').innerHTML = scrapMetal.total.toFixed(0);
	document.getElementById('medical_supplies_count').innerHTML = medicalSupplies.total.toFixed(0);
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
		playerAttributes.hunger += (1 * statusMultiplier);
	} else if(playerAttributes.hunger >= 60){
		playerAttributes.hungry = true;
		playerAttributes.hunger += (1 * statusMultiplier);
	};
	// Thirst
	if(playerAttributes.thirst < 60) {
		playerAttributes.thirsty = false;
		playerAttributes.thirst += (1 * statusMultiplier);
	} else if(playerAttributes.hunger >= 60){
		playerAttributes.thirsty = true;
		playerAttributes.thirst += (1 * statusMultiplier);
	};
	// Rad sickness
	if(playerAttributes.rads < 100) {
		playerAttributes.sick = false;
		playerAttributes.rads += (1 * statusMultiplier);
	} else if(playerAttributes.rads >= 100){
		playerAttributes.sick = true;
		playerAttributes.rads += (1 * statusMultiplier);
	};
}

// Checks player condition and applies status modification
function statusMultiplierFunc() {
	// Status multiplier
	// If none or one
	if(!playerAttributes.hungry || !playerAttributes.thirsty || !playerAttributes.sick) {
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
	if(playerAttributes.hungry) {
		document.getElementById('hungry_status').className = "hungry_status";
	} else {
		document.getElementById('hungry_status').className += " hidden";		
	};
	if(playerAttributes.thirsty) {
		document.getElementById('thirsty_status').className = "thirsty_status";
	} else {
		document.getElementById('thirsty_status').className += " hidden";		
	};
	if(playerAttributes.sick) {
		document.getElementById('sick_status').className = "sick_status";
	} else {
		document.getElementById('sick_status').className += " hidden";		
	};
}


// Main timer function
window.setInterval(function(){
	statusMultiplierFunc()
	console.log('multi', statusMultiplier)
	// updatePlayerStatus();
	updateTotals();
}, 1000);