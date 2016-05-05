function gId(elemId) {
	return document.getElementById(elemId);
}

function generateWeapon(weapon) {  
  //Generate random numbers for the various weapon properties
  var num1 = randomNum(0, (weapon.weapTypes.length - 1)),
  num2 = randomNum(0, (weapon.weapMat.length - 1)),
  num3 = randomNum(0, (weapon.qualityLevels.length - 1)),
  num4 = randomNum(0, (weapon.elemMods.length - 1)),
  num5 = randomNum(0, (weapon.prefixes.length - 1)),
  num6 = randomNum(0, (weapon.suffixes.length - 1)), 
  /*
    I use an object for any stat modifiers a weapon has, 
    for direct property access (instead of having to loop 
    over it every time I need to check it)
  */
  modifiers = {};
  
  /*
    I insert the prefix/suffix modifiers first, so I can use any 
    of their properties (mainly damage modifiers) in later calculations.
    I use the randomNum function here again, since I have a lower and upper
    modified amount for each modifier.
  */
  for (var i = 0; i < weapon.prefixes[num5].statMod.length; i++) { 
	  modifiers[weapon.prefixes[num5].statMod[i]] = randomNum(weapon.prefixes[num5].lowerModAmt[i], weapon.prefixes[num5].upperModAmt[i]);
  };
    
  for (var i = 0; i < weapon.suffixes[num6].statMod.length; i++) {
      /*
        This is where having direct access comes in handy - this determines if the 
        modifiers object already has a property of that specific modifier so it can 
        add/subtract from the value that's already stored in the object.
      */
      if (modifiers.hasOwnProperty(weapon.suffixes[num6].statMod[i])) {
	  	    modifiers[weapon.suffixes[num6].statMod[i]] += randomNum(weapon.suffixes[num6].lowerModAmt[i], weapon.suffixes[num6].upperModAmt[i]);
	  }
	  else {
		  modifiers[weapon.suffixes[num6].statMod[i]] = randomNum(weapon.suffixes[num6].lowerModAmt[i], weapon.suffixes[num6].upperModAmt[i]);
	  }
  };
    
  /*
    These calculations are  used to determine the min/max damage of 
    a weapon after material and quality modifiers are applied.  
  */
  var adjustMinDam = Math.floor((weapon.weapTypes[num1].minDam + weapon.weapMat[num2].minDamMod) * weapon.qualityLevels[num3].damMod),
  adjustMaxDam = Math.floor((weapon.weapTypes[num1].maxDam + weapon.weapMat[num2].maxDamMod) * weapon.qualityLevels[num3].damMod); 
    
  /*
    This, however, changes when an item has a damage modifier on it, 
    so we need to take that into consideration when doing the calculations.
  */
  if (modifiers.hasOwnProperty('Damage')) {
      //Since the damage modifier isn't stored as a percentage in the JSON, we need to convert it to one.
	  var damageMod = (modifiers["Damage"] / 100);
      /*
        As a damage modifier increases the amount of damage that a weapon by a certain percent,
        I just simply calculate the precentage of the already quality/material adjusted damage
        mod and then add it to the overall damage.
      */
      adjustMinDam = Math.floor((adjustMinDam + (adjustMinDam * damageMod)));
      adjustMaxDam = Math.floor((adjustMaxDam + (adjustMaxDam * damageMod)));
  }
    
  //Here we construct a string for the weapon name, using the names from each object in the JSON.
  var weaponName = weapon.elemMods[num4].name + ' ' + weapon.qualityLevels[num3].name + ' ' + weapon.prefixes[num5].name + ' ' + weapon.weapMat[num2].name + ' ' + weapon.weapTypes[num1].name + weapon.suffixes[num6].name;
    
  /*
    This quality level is eventually used to determine the "rarity" of an item. All the
    'non-essential' quality modifiers (such as weapon type, prefix/suffix quality modifiers)
    are just simply added together - and the 'main' quality modifier (which is the overall
    quality of the weapon itself) is used muliplicatively, since the way I see it, it has
    a great overall impact on the "value" than anything else.
  */
  var weaponQuality = Math.floor((weapon.weapTypes[num1].baseQuality + weapon.weapMat[num2].qualityMod + weapon.elemMods[num4].qualityMod + weapon.prefixes[num5].qualityMod + weapon.suffixes[num6].qualityMod) * weapon.qualityLevels[num3].qualityMod);
  
    
  /*
    Since I wanted weapons to be potentially generated without elemental mods, 
    I put in a "dummy" entry into the array of different elemental mods, but
    as that one has default values attached to it, I saw no need to do further
    calculcations on the damage itself if that was the case. So therefore
  */
  if(weapon.elemMods[num4].name != " ") {
  	adjustMinDam = Math.floor(adjustMinDam + (adjustMinDam * weapon.elemMods[num4].damMod)); 
  	adjustMaxDam = Math.floor(adjustMaxDam + (adjustMaxDam * weapon.elemMods[num4].damMod));
  }
    
  /*
    Every entry in the elemental mods array does have a damage 
    type associated with it (even the dummy entry), so I use this
    to determine what type of damage the weapon will do.
  */
  var damType = weapon.elemMods[num4].damType;  
  
  var wCost = Math.ceil((weapon.weapTypes[num1].baseCost * weapon.weapMat[num2].costMod * weapon.elemMods[num4].costMod * weapon.prefixes[num5].costMod * weapon.suffixes[num6].costMod) * weapon.qualityLevels[num3].costMod);
    
  return {
  /*
    I return an object from this function, since that's the easiest way
    to keep the values distinct from each other while still allowing
    for direct property access (which I use when it comes to rendering
    the weapon's item card).
  */
   gWeap: {
      name: weaponName,
      quality: weaponQuality,
      minDam: adjustMinDam,
      maxDam: adjustMaxDam,
	  damType: damType,
	  statMod: modifiers,
	  cost: wCost
    }    
  }
}

function randomNum(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

gId('itemGen').addEventListener('click', function() {
	$.ajax({
		url: "/weapon",
		dataType: "json"			
	})	
	.done(function(data) {
        gId('weaponContainer').innerHTML = '';
        var weaponDiv = document.createElement('div');
        for(var i = 0; i < 6; i++) {
            var weap1 = generateWeapon(data);
            var innerContainer = document.createElement('div'),
                wName = document.createElement('p'), 
                wDam = document.createElement('p'), 
                wCost = document.createElement('p');
            /*
                This was done to generate a sub-section of the item
                card only if stat modifiers exist - mainly to prevent
                border "stacking" and just generally provide a cleaner
                overall look to the cards.
            */
            if(Object.keys(weap1.gWeap.statMod).length > 0) {
               var wStat = document.createElement('p');
                wStat.innerHTML = '<p>Stat Mods</p>';
            }
            else { var wStat = undefined; }
            innerContainer.setAttribute('class', 'weaponContainer');
            wName.setAttribute('class', 'wName');
            
            /*
                I use the weapon's quality here to determine its
                "rarity" and then adjust its label appropriately
                (Although I should probably find a better metric
                to determine this, as it can assign a high rarity
                to an item that costs much less than other items
                of the same rarity level.
            */
            if(weap1.gWeap.quality < 300) {
                wName.style.backgroundColor = 'Black';
            }
            if (weap1.gWeap.quality >= 300 && weap1.gWeap.quality < 500) {
                wName.style.backgroundColor = 'Blue';		
            }
            if (weap1.gWeap.quality >= 500 && weap1.gWeap.quality < 1000) {
                wName.style.backgroundColor = 'Green';		
            }
            if (weap1.gWeap.quality >= 1000) {
                wName.style.backgroundColor = 'Purple';		
            }
            wName.innerHTML = weap1.gWeap.name;			
            wDam.innerHTML = 'Damage: ' + weap1.gWeap.minDam + ' - ' + weap1.gWeap.maxDam + ' ' + weap1.gWeap.damType;
            
            /*
                This determines if the stat modifier block exists - and if it does
                append the stat modifiers to it.
            */
            if(wStat){
                    for (var j = 0; j < Object.keys(weap1.gWeap.statMod).length; j++) {
                        var mod = document.createElement('p');
                        mod.setAttribute('class', 'wMod');
                        //I use this here to automatically convert any modifiers stored as a percentage into a standard number
                        if(weap1.gWeap.statMod[Object.keys(weap1.gWeap.statMod)[j]] < 1) {
                            weap1.gWeap.statMod[Object.keys(weap1.gWeap.statMod)[j]] = Math.floor(weap1.gWeap.statMod[Object.keys(weap1.gWeap.statMod)[j]] * 100)+ '%';
                        }
                        /*
                            Since I wanted to make it clearer that the damage modifiers only applied to the weapon itself,
                            I decided to give it a more verbose description, and only if the damage modifier exists
                            inside of the stat modifier property
                        */
                        if (Object.keys(weap1.gWeap.statMod)[j] === 'Damage') {
                            weap1.gWeap.statMod[Object.keys(weap1.gWeap.statMod)[j]] = weap1.gWeap.statMod[Object.keys(weap1.gWeap.statMod)[j]] + '% Increased Weapon ';
                        }
                        mod.innerHTML = '+' + weap1.gWeap.statMod[Object.keys(weap1.gWeap.statMod)[j]] + ' ' + Object.keys(weap1.gWeap.statMod)[j];
                        wStat.appendChild(mod);
                    }
            }
            wCost.innerHTML = weap1.gWeap.cost + 'g';
            innerContainer.appendChild(wName);
            innerContainer.appendChild(wDam);
            if (wStat) {
                innerContainer.appendChild(wStat);
            }
            innerContainer.appendChild(wCost);
            weaponDiv.appendChild(innerContainer);
        }
        gId('weaponContainer').appendChild(weaponDiv);
	})		

});