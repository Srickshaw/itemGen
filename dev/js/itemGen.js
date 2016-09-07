const gId = (elemId) => {
  return document.getElementById(elemId);
}

const checkQuality = (itemObj, {type, materialType, tier: gearTier}, qual) => {
  const {
    applicableGearTypes,
    tier: qualityTier,
    applicableMaterial
  } = itemObj.qualityLevels[qual];

  return !(
    !applicableGearTypes.hasOwnProperty(type) ||
    qualityTier > gearTier ||
    !applicableMaterial.hasOwnProperty(materialType)
  );
}

const checkPrefix = (itemObj, gearPiece, prefix) => {
  if (itemObj.prefixes[prefix].tier > gearPiece.tier) {
    return false;
  }
  return itemObj.prefixes[prefix];
}

const checkSuffix = (itemObj, gearPiece, suffix) => {
  if (itemObj.suffixes[suffix].tier > gearPiece.tier) {
    return false;
  }
  return itemObj.suffixes[suffix];
}

const checkElemMod = (elemMod, gearPiece) => {
  if (elemMod.tier > gearPiece.tier) {
    return false;
  }
  return elemMod;
}

const getGearType = (itemObj, gearType) => {
  return itemObj.itemTypes[gearType];
}

const generateBaseItem = (itemObj, gearType) => {
  const gGearType = getGearType(itemObj, gearType);
  const itemTypePos = randomNum(0, (gGearType.length - 1));
  return itemObj.itemTypes[gearType][itemTypePos];
}

const generateMaterial = (itemObj, gearPiece) => {
  const itemMatPos = randomNum(0, (itemObj.itemMaterials[gearPiece.materialType].length - 1));
  return itemObj.itemMaterials[gearPiece.materialType][itemMatPos];
}

const addQualityLevel = (itemObj, generatedItem) => {
  let itemQualityPos =  generateQuality(itemObj);
  let iProps = checkQuality(itemObj, generatedItem["item"], itemQualityPos);
  while(iProps === false) {
    itemQualityPos =  generateQuality(itemObj);
    iProps = checkQuality(itemObj, generatedItem["item"], itemQualityPos);
  }
  return itemObj.qualityLevels[itemQualityPos];
}

const generateQuality = (itemObj) => {
  return randomNum(0, (itemObj.qualityLevels.length - 1));
}

const generatePrefix = (itemObj) => {
  return randomNum(0, (itemObj.prefixes.length - 1));
}

const generateSuffix = (itemObj) => {
  return randomNum(0, (itemObj.prefixes.length - 1));
}

function addPrefix(itemObj, gearPiece) {
  let prefixCheck = checkPrefix(itemObj, gearPiece, generatePrefix(itemObj));
  while (prefixCheck === false) {
    prefixCheck = checkPrefix(itemObj, gearPiece, generatePrefix(itemObj));
  }
  return prefixCheck;
}

function addSuffix(itemObj, gearPiece) {
  let suffixCheck = checkSuffix(itemObj, gearPiece, generateSuffix(itemObj));
  while (suffixCheck === false) {
    suffixCheck = checkSuffix(itemObj, gearPiece, generateSuffix(itemObj));
  }
  return suffixCheck;
}

function calculateModifiers(generatedItem) {
  let modifiers = {};
  if(generatedItem.prefix.name !== "") {
    modifiers = Object.assign(modifiers,Object.keys(generatedItem.prefix.statMod).reduce((a, b, i) =>
    {
      a[generatedItem.prefix.statMod[i]] = randomNum(generatedItem.prefix.lowerModAmt[i], generatedItem.prefix.upperModAmt[i]);
      return a;
    }, {}));
  }
	console.log(modifiers)
  if(generatedItem.suffix.name !== ""){
    modifiers = Object.assign(modifiers, Object.keys(generatedItem.suffix.statMod).reduce((a, b, i) =>
    {
      const calcSuffixMod = randomNum(generatedItem.suffix.lowerModAmt[i], generatedItem.suffix.upperModAmt[i])
      if(a.hasOwnProperty(generatedItem.suffix.statMod[i])) {
        a[generatedItem.suffix.statMod[i]] += calcSuffixMod;
      } else {
        a[generatedItem.suffix.statMod[i]] = calcSuffixMod;
      }
      return a
    }, {}));
  }
  return modifiers;
}

const generateElemMod = (itemObj) => {
  return randomNum(0, (itemObj.elemMods.length - 1));
}

const addElemMod = (itemObj, gearPiece, generatedItem) => {
  let checkElem = checkElemMod(itemObj.elemMods[generateElemMod(itemObj)], gearPiece);
  while(checkElem === false) {
    checkElem = checkElemMod(itemObj.elemMods[generateElemMod(itemObj)], gearPiece);
  }
	console.log(checkElem);
  return checkElem;
}

const generateItemName = (generatedItem) => {
  return `${generatedItem["elemMod"].name} ${generatedItem["quality"].name} ${generatedItem["prefix"].name} ${generatedItem["material"].name} ${generatedItem["item"].name} ${generatedItem["suffix"].name}`;
}

const calculateItemStats = (generatedItem) => {
  if(generatedItem.item.type == 'weapon') {
    return calculateDamage(generatedItem);
  }
  else if(generatedItem.item.type == 'armor') {
    return calculateArmor(generatedItem);
  }
}

const calculateDamage = (generatedItem) => {
  let baseMinDam = Math.floor((generatedItem.item.minDam + generatedItem.material.minDamMod) * generatedItem.quality.damMod);
  let baseMaxDam = Math.floor((generatedItem.item.maxDam + generatedItem.material.maxDamMod) * generatedItem.quality.damMod);
  const weaponDamage = {}
  if (generatedItem.modifiers.hasOwnProperty('damage')) {
    baseMinDam = Math.floor(baseMinDam + ( baseMinDam * (generatedItem.modifiers["Damage"] / 100)));
    baseMaxDam = Math.floor(baseMinDam + ( baseMinDam * (generatedItem.modifiers["Damage"] / 100)));
  }
  if (generatedItem.elemMod.name != '') {
    baseMinDam = Math.floor(baseMinDam + (baseMinDam * generatedItem.elemMod.damMod));
    baseMaxDam = Math.floor(baseMaxDam + (baseMaxDam * generatedItem.elemMod.damMod));
  }
  weaponDamage['minDam'] = baseMinDam;
  weaponDamage['maxDam'] = baseMaxDam;
  return weaponDamage
}


const calculateArmor = generatedItem => {
  const baseArmor = randomNum(generatedItem.item.minArmor, generatedItem.item.maxArmor);
  const a = {};
  if (generatedItem.elemMod.name != '') {
    generatedItem['modifiers'][`${generatedItem.elemMod.elemType} Resistance`] = generatedItem.elemMod.resistance;
  }
  a['armorValue'] = Math.floor((baseArmor + generatedItem.material.armorMod) * generatedItem.quality.armorMod);
  return a;
}

const calculateQuality = (generatedItem) => {
  return Math.floor((generatedItem.item.baseQuality + generatedItem.material.qualityMod +
  generatedItem.elemMod.qualityMod + generatedItem.prefix.qualityMod + generatedItem.suffix.qualityMod) *
  generatedItem.quality.qualityMod);
};

const calculateCost = (generatedItem) => {
  return Math.ceil((generatedItem.item.baseCost * generatedItem.material.costMod *
    generatedItem.elemMod.costMod * generatedItem.prefix.costMod * generatedItem.suffix.costMod) *
    generatedItem.quality.costMod);
}

const generateWeapon = (weapon, type) => {
  const newGenItem = {};
  newGenItem['item'] = generateBaseItem(weapon, type);
  newGenItem['material'] = generateMaterial(weapon, newGenItem['item']);
  newGenItem['quality'] = addQualityLevel(weapon, newGenItem);
  newGenItem['elemMod'] = addElemMod(weapon, newGenItem['item'], newGenItem);
  newGenItem['prefix'] = addPrefix(weapon, newGenItem['item']);
  newGenItem['suffix'] = addSuffix(weapon, newGenItem['item']);
  newGenItem['modifiers'] = calculateModifiers(newGenItem);
  newGenItem['mainStat'] = calculateItemStats(newGenItem);
  newGenItem['name'] = generateItemName(newGenItem);
  newGenItem['cost'] = calculateCost(newGenItem);
  console.log(newGenItem);
  return newGenItem;
}

const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const prettifyModifiers = (modifierKeys, modifiers) => {
  return modifierKeys.map((index, value) => {
    if(modifiers[index] < 1) {
      return `+${Math.floor(modifiers[index] * 100)}%  ${index}`;
    }
    else if (index === 'Damage') {
      return `+${modifiers[index]}% Increased Weapon ${index}`;
    }
    else {
      return `+${modifiers[index]} ${index}`;
    }
  });
}

const createComponent = (type, children, classArr = []) => {
  let newElement = document.createElement(type);
  const cssClassesToAdd = classArr.join(' ');
  newElement.setAttribute('class', cssClassesToAdd);
  children.forEach((index) => {
    if (typeof index === 'string') {
      let newText = document.createTextNode(index);
      newElement.appendChild(newText);
    }
    else {
      newElement.appendChild(index)
    }
  });
  return newElement;
}

const createDamArmString = (itemType, itemObj) => {
  if(itemType === 'weapon') {
    return `Damage: ${itemObj.mainStat.minDam}  -  ${itemObj.mainStat.maxDam} ${itemObj.elemMod.elemType} | Slot: ${itemObj.item.slot}`;
  }
  return `Armor: ${itemObj.mainStat.armorValue} | Slot: ${itemObj.item.slot}`;
}

const determineRarity = (itemObj) => {
  const elemModName = itemObj.elemMod.name;
  const prefixName = itemObj.prefix.name;
  const suffixName = itemObj.suffix.name;
  if(elemModName || prefixName || suffixName) {
    let namePlateClass = 'nameplate-uncommon';
    if(elemModName && prefixName || elemModName && suffixName ||
    prefixName && suffixName) {
      namePlateClass = 'nameplate-rare';
    }
    if(elemModName && prefixName && suffixName) {
      namePlateClass = 'nameplate-epic';
      if(itemObj.qualityLevel >= 1000) {
        namePlateClass = 'nameplate-legendary';
      }
    }
    return namePlateClass;
  }
}

const iterativeFunc = (maxValue, callback) => {
  let genericItemArray = [];
  for (let i = 0; i < maxValue; i++) {
    genericItemArray.push(callback(i));
  }
  return genericItemArray;
}

gId('itemGen').addEventListener('click', () => {
  $.ajax({
    url: "/weapon",
    dataType: "json"
  })
  .done(function(data) {
    gId('weaponContainer').innerHTML = '';
    const weaponDiv = createComponent('div', iterativeFunc(6, (i) => {
      const itemTypeValue = randomNum(0, (Object.keys(data.itemTypes).length - 1));
      console.log("=========================");
      console.log("Data for " + Object.keys(data.itemTypes)[itemTypeValue] + " #" + (i + 1));
      console.log("=========================");
      const newItem = generateWeapon(data, Object.keys(data.itemTypes)[itemTypeValue]);
      const wCost = createComponent('p', [`Cost: ${newItem.cost.toLocaleString()} g`]);
      return createComponent('div', (function(){
        const itemProps = [
          createComponent('p', [newItem.name], ['wName', determineRarity(newItem)]),
          createComponent('p', [createDamArmString(newItem.item.type, newItem)])
        ];
        if (Object.keys(newItem.modifiers).length > 0) {
          const mods = prettifyModifiers(Object.keys(newItem.modifiers), newItem.modifiers);
          const wStat = createComponent('div', mods.map((mod) => createComponent('p', [mod], ['modString'])), ['stat-container']);
          itemProps.push(wStat);
        }
        itemProps.push(wCost);
        return itemProps;
      })(), ['weaponCard']);
    }));
    gId('weaponContainer').appendChild(weaponDiv);
  })
});
