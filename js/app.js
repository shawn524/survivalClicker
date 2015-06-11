// Survival Clicker
// An incremental game with a post apocalyptic twist
var version = 0.1

// Initialize values
var playerAttributes = {
	'name': 'Pip',
	'health': 100,
	'hunger': 0,
	'thirst': 0,
	'rads': 10
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
    // console.log('total weight',total_weight)
     
    var random_num = rand(0, total_weight);
    // console.log('random num', random_num)
    var weight_sum = 0;
     
    for (var i = 0; i < basicSupplies.length; i++) {
        weight_sum += weight[i];
        // console.log(weight[i])
        weight_sum = +weight_sum.toFixed(2);
        // console.log('weight sum',weight_sum)
        var item_drop = basicSupplies[i]
         
        if (random_num <= weight_sum) {
        	item_drop.total++
            console.log('found some',basicSupplies[i].name)
            break;
        }
    }
    updateTotals()
};

function updateTotals() {
	// Supplies
    document.getElementById('food_count').innerHTML = food.total;
	document.getElementById('water_count').innerHTML = water.total;
	document.getElementById('ammo_count').innerHTML = ammo.total;
	document.getElementById('scrap_metal_count').innerHTML = scrapMetal.total;
	document.getElementById('medical_supplies_count').innerHTML = medicalSupplies.total;	
	// Attributes
	document.getElementById('health_count').innerHTML = playerAttributes.health;	
	document.getElementById('hunger_count').innerHTML = playerAttributes.hunger;
	document.getElementById('thirst_count').innerHTML = playerAttributes.thirst;
	document.getElementById('rads_count').innerHTML = playerAttributes.rads;

}




// Main timer function
window.setInterval(function(){


	updateTotals()
}, 1000);