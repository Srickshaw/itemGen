const gId = elemId => {
	return document.getElementById(elemId);
};

const checkProps = (itemObj, gearType, itemType, qual, mat) => {
	if (!itemObj.qualityLevels[qual].applicableGearTypes.hasOwnProperty(gearType) || itemObj.qualityLevels[qual].tier > itemObj.itemTypes[gearType][itemType].tier || !itemObj.qualityLevels[qual].applicableMaterial.hasOwnProperty(mat)) {
		return false;
	} else {
		return true;
	}
};

const getObj = itemObj => {
	return itemObj;
};

const getGearType = (weapon, gearType) => {
	let itemObj = getObj(weapon);
	return itemObj.itemTypes[gearType];
};

const generateItem = (weapon, gearType) => {
	let gGearType = getGearType(weapon, gearType);
	let itemTypePos = randomNum(0, gGearType.length - 1);
	return weapon.itemTypes[gearType][itemTypePos];
};

const generateMaterial = (itemObj, gearPiece) => {
	let itemMatPos = randomNum(0, itemObj.itemMaterials[gearPiece.materialType].length - 1);
	return itemObj.itemMaterials[gearPiece.materialType][itemMatPos];
};

const generateWeapon = (weapon, type) => {
	let iType = randomNum(0, weapon.itemTypes[type].length - 1);
	let iMatType = weapon.itemTypes[type][iType].materialType;
	let iMaterial = randomNum(0, weapon.itemMaterials[iMatType].length - 1);
	let iQuality = randomNum(0, weapon.qualityLevels.length - 1);
	let iPrefix = randomNum(0, weapon.prefixes.length - 1);
	let iSuffix = randomNum(0, weapon.suffixes.length - 1);
	let armorValue = '';
	let modifiers = {};
	let adjustMinDam;
	let adjustMaxDam;

	let testObj = getObj(weapon);
	let testItem = generateItem(testObj, type);
	console.log(testItem);
	let testVar = generateMaterial(testObj, testItem);
	console.log(testVar);

	let hasElem = false;
	let hasPrefix = false;
	let hasSuffix = false;
	let iElem = randomNum(0, weapon.elemMods.length - 1);
	console.log("Initial elemental mod tier: " + weapon.elemMods[iElem].tier);
	while (weapon.elemMods[iElem].tier > weapon.itemTypes[type][iType].tier) {
		iElem = randomNum(0, weapon.elemMods.length - 1);
	}
	if (iElem != 0) {
		hasElem = true;
	}

	console.log("Item tier: " + weapon.itemTypes[type][iType].tier);
	console.log("Initial quality tier: " + weapon.qualityLevels[iQuality].tier);
	console.log("Initial prefix tier: " + weapon.prefixes[iPrefix].tier);
	console.log("Initial suffix tier: " + weapon.suffixes[iSuffix].tier);
	let iProps = checkProps(weapon, type, iType, iQuality, iMatType);

	while (iProps == false) {
		iQuality = randomNum(0, weapon.qualityLevels.length - 1);
		iProps = checkProps(weapon, type, iType, iQuality, iMatType);
	}

	while (weapon.prefixes[iPrefix].tier > weapon.itemTypes[type][iType].tier) {
		iPrefix = randomNum(0, weapon.prefixes.length - 1);
	}

	while (weapon.suffixes[iSuffix].tier > weapon.itemTypes[type][iType].tier) {
		iSuffix = randomNum(0, weapon.suffixes.length - 1);
	}

	console.log("Modified quality tier: " + weapon.qualityLevels[iQuality].tier);
	console.log("Modified prefix tier: " + weapon.prefixes[iPrefix].tier);
	console.log("Modified suffix tier: " + weapon.suffixes[iSuffix].tier);
	console.log("Modified elemental mod tier: " + weapon.elemMods[iElem].tier);

	console.log(Object.keys(weapon.prefixes[iPrefix].statMod));
	Object.keys(weapon.prefixes[iPrefix].statMod).forEach(index => {
		console.log(index);
		modifiers[weapon.prefixes[iPrefix].statMod[index]] = randomNum(weapon.prefixes[iPrefix].lowerModAmt[index], weapon.prefixes[iPrefix].upperModAmt[index]);
	});

	Object.keys(weapon.suffixes[iSuffix].statMod).forEach(index => {
		hasSuffix = true;
		if (modifiers.hasOwnProperty(weapon.suffixes[iSuffix].statMod[index])) {
			modifiers[weapon.suffixes[iSuffix].statMod[index]] += randomNum(weapon.suffixes[iSuffix].lowerModAmt[index], weapon.suffixes[iSuffix].upperModAmt[index]);
		} else {
			modifiers[weapon.suffixes[iSuffix].statMod[index]] = randomNum(weapon.suffixes[iSuffix].lowerModAmt[index], weapon.suffixes[iSuffix].upperModAmt[index]);
		}
	});

	let elemType = weapon.elemMods[iElem].elemType;
	if (type === 'weapon') {

		adjustMinDam = Math.floor((weapon.itemTypes[type][iType].minDam + weapon.itemMaterials[iMatType][iMaterial].minDamMod) * weapon.qualityLevels[iQuality].damMod);
		adjustMaxDam = Math.floor((weapon.itemTypes[type][iType].maxDam + weapon.itemMaterials[iMatType][iMaterial].maxDamMod) * weapon.qualityLevels[iQuality].damMod);
		console.log('min dam: ' + adjustMinDam + ' max dam: ' + adjustMaxDam);

		if (modifiers.hasOwnProperty('Damage')) {
			let damageMod = modifiers["Damage"] / 100;
			adjustMinDam = Math.floor(adjustMinDam + adjustMinDam * damageMod);
			adjustMaxDam = Math.floor(adjustMaxDam + adjustMaxDam * damageMod);
		}

		if (weapon.elemMods[iElem].name != " ") {
			adjustMinDam = Math.floor(adjustMinDam + adjustMinDam * weapon.elemMods[iElem].damMod);
			adjustMaxDam = Math.floor(adjustMaxDam + adjustMaxDam * weapon.elemMods[iElem].damMod);
		}
	}
	if (type === 'armor') {
		adjustMinDam = '';
		adjustMaxDam = '';
		if (iElem != 0) {
			modifiers[elemType + ' Resistance'] = weapon.elemMods[iElem].resistance;
		}
		armorValue = randomNum(weapon.itemTypes[type][iType].minArmor, weapon.itemTypes[type][iType].maxArmor);
		armorValue = Math.floor((armorValue + weapon.itemMaterials[iMatType][iMaterial].armorMod) * weapon.qualityLevels[iQuality].armorMod);
	}

	let weaponQuality = Math.floor((weapon.itemTypes[type][iType].baseQuality + weapon.itemMaterials[iMatType][iMaterial].qualityMod + weapon.elemMods[iElem].qualityMod + weapon.prefixes[iPrefix].qualityMod + weapon.suffixes[iSuffix].qualityMod) * weapon.qualityLevels[iQuality].qualityMod);
	let wCost = Math.ceil(weapon.itemTypes[type][iType].baseCost * weapon.itemMaterials[iMatType][iMaterial].costMod * weapon.elemMods[iElem].costMod * weapon.prefixes[iPrefix].costMod * weapon.suffixes[iSuffix].costMod * weapon.qualityLevels[iQuality].costMod);

	let weaponName = weapon.elemMods[iElem].name + ' ' + weapon.qualityLevels[iQuality].name + ' ' + weapon.prefixes[iPrefix].name + ' ' + weapon.itemMaterials[iMatType][iMaterial].name + ' ' + weapon.itemTypes[type][iType].name + weapon.suffixes[iSuffix].name;
	let wSlot = weapon.itemTypes[type][iType].slot;

	return {
		gWeap: {
			name: weaponName,
			type: weapon.itemTypes[type][iType].name,
			quality: weaponQuality,
			minDam: adjustMinDam,
			maxDam: adjustMaxDam,
			armor: armorValue,
			hasElem: hasElem,
			hasPrefix: hasPrefix,
			hasSuffix: hasSuffix,
			elemType: elemType,
			statMod: modifiers,
			cost: wCost,
			slot: wSlot
		}
	};
};

const randomNum = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const prettifyModifiers = (arr, obj) => {
	let prettyMod = [];
	let newString;
	arr.forEach(index => {
		if (obj[index] < 1) {
			newString = '+' + Math.floor(obj[index] * 100) + '% ' + index;
			prettyMod.push(newString);
		} else if (index === 'Damage') {
			newString = '+' + obj[index] + '% Increased Weapon ' + index;
			prettyMod.push(newString);
		} else {
			prettyMod.push('+' + obj[index] + ' ' + index);
		}
	});
	return prettyMod;
};

const createComponent = (type, children, classArr = []) => {
	let newElement = document.createElement(type);
	classArr.forEach(cssClass => newElement.setAttribute('class', cssClass));
	children.forEach(index => {
		if (typeof index === 'string') {
			let newText = document.createTextNode(index);
			newElement.appendChild(newText);
		} else {
			newElement.appendChild(index);
		}
	});
	return newElement;
};

const createDamArmString = (arr, obj) => {
	let wDam;
	if (arr === 'weapon') {
		wDam = 'Damage: ' + obj.minDam + ' - ' + obj.maxDam + ' ' + obj.elemType + " | Slot: " + obj.slot;
	} else {
		wDam = 'Armor: ' + obj.armor + " | Slot: " + obj.slot;
	}
	return wDam;
};

gId('itemGen').addEventListener('click', function () {
	$.ajax({
		url: "/weapon",
		dataType: "json"
	}).done(function (data) {
		gId('weaponContainer').innerHTML = '';
		let weaponDiv = document.createElement('div');
		for (var i = 0; i < 6; i++) {
			let itemTypeValue = randomNum(0, Object.keys(data.itemTypes).length - 1);
			let itemProps = [];
			console.log("=========================");
			console.log("Data for " + Object.keys(data.itemTypes)[itemTypeValue] + " #" + (i + 1));
			console.log("=========================");
			let weap1 = generateWeapon(data, Object.keys(data.itemTypes)[itemTypeValue]);
			let wName = createComponent('p', [weap1.gWeap.name], ['wName']);
			itemProps.push(wName);

			let weaponDam = createComponent('p', [createDamArmString(Object.keys(data.itemTypes)[itemTypeValue], weap1.gWeap)]);
			itemProps.push(weaponDam);

			if (Object.keys(weap1.gWeap.statMod).length > 0) {
				let mods = prettifyModifiers(Object.keys(weap1.gWeap.statMod), weap1.gWeap.statMod);
				let wStat = createComponent('div', mods.map(mod => createComponent('p', [mod], ['modString'])), ['stat-container']);
				itemProps.push(wStat);
			}
			console.log(weap1.gWeap.elemType);
			if (!weap1.gWeap.hasElem && !weap1.gWeap.hasPrefix && !weap1.gWeap.hasSuffix) {
				wName.style.backgroundColor = 'Black'; //Common
			} else if (weap1.gWeap.hasElem || weap1.gWeap.hasPrefix || weap1.gWeap.hasSuffix) {
					wName.style.backgroundColor = '#206720'; //Green Uncommon
					if (weap1.gWeap.hasPrefix && weap1.gWeap.hasElem || weap1.gWeap.hasSuffix & weap1.gWeap.hasElem || weap1.gWeap.hasPrefix && weap1.gWeap.hasSuffix) {
						wName.style.backgroundColor = '#2424a2'; //Blue Rare
					}
					if (weap1.gWeap.hasPrefix && weap1.gWeap.hasSuffix && weap1.gWeap.hasElem) {
						wName.style.backgroundColor = 'Purple'; //Purple
						if (weap1.gWeap.quality >= 1000) {
							wName.style.backgroundColor = '#d35d13'; //Orange Legendary
							let firstNamePosition = randomNum(0, data.legendaryNames.first.length - 1);
							let secondNamePosition = randomNum(0, data.legendaryNames.second.length - 1);
							wName.innerHTML = "The " + weap1.gWeap.type + " '" + data.legendaryNames.first[firstNamePosition] + data.legendaryNames.second[secondNamePosition] + "'";
						}
					}
				}

			let wCost = createComponent('p', ['Cost: ' + weap1.gWeap.cost + 'g']);
			itemProps.push(wCost);

			let innerContainer = createComponent('div', itemProps, ['weaponContainer']);
			weaponDiv.appendChild(innerContainer);
		}
		gId('weaponContainer').appendChild(weaponDiv);
	});
});