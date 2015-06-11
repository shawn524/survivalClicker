// Survival Clicker
// An incremental game with a post apocalyptic twist
var version = 0.1

// Initialize values
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
            console.log(basicSupplies[i].name)
            break;
        }
    }
     
    document.getElementById('food_count').innerHTML = food.total;
	document.getElementById('water_count').innerHTML = water.total;
	document.getElementById('ammo_count').innerHTML = ammo.total;
	document.getElementById('scrap_metal_count').innerHTML = scrapMetal.total;
	document.getElementById('medical_supplies_count').innerHTML = medicalSupplies.total;
};