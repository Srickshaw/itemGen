const gId = (elemId) => {
  return document.getElementById(elemId);
}

// const checkProps = (itemObj, gearPiece, qual) => {
//   if(!itemObj.qualityLevels[qual].applicableGearTypes.hasOwnProperty(gearPiece.type) ||
//   itemObj.qualityLevels[qual].tier > gearPiece.tier ||
//   !itemObj.qualityLevels[qual].applicableMaterial.hasOwnProperty(gearPiece.materialType)) {
//     return false;
//   }
//   else {
//     return true;
//   }
// }

const checkProps = (itemObj, {type, materialType, tier: gearTier}, qual) => {
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

const checkPreSuf = (itemObj, gearPiece, pre, suf) => {
  if (itemObj.prefixes[pre].tier > gearPiece.tier && itemObj.suffixes[suf].tier > gearPiece.tier) {
    return false;
  }
  return [
    itemObj.prefixes[pre],
    itemObj.suffixes[suf]
	]
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

const generateItem = (itemObj, gearType) => {
  const generatedItem = {};
  generatedItem["item"] = generateBaseItem(itemObj, gearType);
  generatedItem["material"] = generateMaterial(itemObj, generatedItem["item"]);
  let itemQualityPos =  generateQuality(itemObj);
  let iProps = checkProps(itemObj, generatedItem["item"], itemQualityPos);
  while(iProps === false) {
    itemQualityPos =  generateQuality(itemObj);
    iProps = checkProps(itemObj, generatedItem["item"], itemQualityPos);
  }
  generatedItem["quality"] = itemObj.qualityLevels[itemQualityPos];
  return generatedItem;
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

const addPreSuf = (itemObj, gearPiece, generatedItem) => {
  let check = checkPreSuf(itemObj, gearPiece, generatePrefix(itemObj), generateSuffix(itemObj));
  while (check == false) {
    check = checkPreSuf(itemObj, gearPiece, generatePrefix(itemObj), generateSuffix(itemObj))
	}
  generatedItem['prefix'] = check[0];
  generatedItem['suffix'] = check[1];
}

const calculateModifiers = (generatedItem) => {
  generatedItem['modifiers'] = {};
  if (generatedItem.prefix.name != '') {
    Object.keys(generatedItem.prefix.statMod).forEach((index) => {
       generatedItem['modifiers'][generatedItem.prefix.statMod[index]] = randomNum(generatedItem.prefix.lowerModAmt[index],
       generatedItem.prefix.upperModAmt[index]);
    });
  }
  if (generatedItem.suffix.name != '') {
    Object.keys(generatedItem.suffix.statMod).forEach((index) => {
      const calculatedSuffixMod = randomNum(generatedItem.suffix.lowerModAmt[index], generatedItem.suffix.upperModAmt[index])
      if (generatedItem['modifiers'].hasOwnProperty(generatedItem.suffix.statMod[index])) {
        generatedItem['modifiers'][generatedItem.suffix.statMod[index]] += calculatedSuffixMod;
      }
      else {
        generatedItem['modifiers'][generatedItem.suffix.statMod[index]] = calculatedSuffixMod;
      }
    });
  }
}

const generateElemMod = (itemObj) => {
  return randomNum(0, (itemObj.elemMods.length - 1));
}

const addElemMod = (itemObj, gearPiece, generatedItem) => {
  let checkElem = checkElemMod(itemObj.elemMods[generateElemMod(itemObj)], gearPiece);
  while(checkElem === false) {
    checkElem = checkElemMod(itemObj.elemMods[generateElemMod(itemObj)], gearPiece);
  }
  generatedItem['elemMod'] = checkElem;
}

const generateItemName = (generatedItem) => {
  generatedItem["name"] = `${generatedItem["elemMod"].name} ${generatedItem["quality"].name} ${generatedItem["prefix"].name} ${generatedItem["material"].name} ${generatedItem["item"].name} ${generatedItem["suffix"].name}`;
}

const calculateDamArm = (generatedItem) => {
  if(generatedItem.item.type == 'weapon') {
    let baseMinDam = Math.floor((generatedItem.item.minDam + generatedItem.material.minDamMod) * generatedItem.quality.damMod);
    let baseMaxDam = Math.floor((generatedItem.item.maxDam + generatedItem.material.maxDamMod) * generatedItem.quality.damMod);
    if (generatedItem.modifiers.hasOwnProperty('damage')) {
      baseMinDam = Math.floor(baseMinDam + ( baseMinDam * (generatedItem.modifiers["Damage"] / 100)));
      baseMaxDam = Math.floor(baseMinDam + ( baseMinDam * (generatedItem.modifiers["Damage"] / 100)));
    }
    if (generatedItem.elemMod.name != '') {
      baseMinDam = Math.floor(baseMinDam + (baseMinDam * generatedItem.elemMod.damMod));
      baseMaxDam = Math.floor(baseMaxDam + (baseMaxDam * generatedItem.elemMod.damMod));
    }
    generatedItem['minDam'] = baseMinDam;
    generatedItem['maxDam'] = baseMaxDam;
  }
  else if(generatedItem.item.type == 'armor') {
    const baseArmor = randomNum(generatedItem.item.minArmor, generatedItem.item.maxArmor);
    if (generatedItem.elemMod.name != '') {
      generatedItem['modifiers'][`${generatedItem.elemMod.elemType} Resistance`] = generatedItem.elemMod.resistance;
    }
    generatedItem['armorValue'] = Math.floor((baseArmor + generatedItem.material.armorMod) * generatedItem.quality.armorMod);
  }
}

const calculateQuality = (generatedItem) => {
  generatedItem['qualityLevel'] = Math.floor((generatedItem.item.baseQuality + generatedItem.material.qualityMod +
  generatedItem.elemMod.qualityMod + generatedItem.prefix.qualityMod + generatedItem.suffix.qualityMod) *
  generatedItem.quality.qualityMod);
};

const calculateCost = (generatedItem) => {
  generatedItem['cost'] = Math.ceil((generatedItem.item.baseCost * generatedItem.material.costMod *
    generatedItem.elemMod.costMod * generatedItem.prefix.costMod * generatedItem.suffix.costMod) *
    generatedItem.quality.costMod);
}

const generateWeapon = (weapon, type) => {
  const newGenItem = generateItem(weapon, type);
  addPreSuf(weapon, newGenItem.item, newGenItem);
  calculateModifiers(newGenItem);
  addElemMod(weapon, newGenItem.item, newGenItem);
  generateItemName(newGenItem);
  calculateDamArm(newGenItem);
  calculateQuality(newGenItem);
  calculateCost(newGenItem);
  console.log(newGenItem);
  return newGenItem;
}

const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const prettifyModifiers = (arr, obj) => {
  return arr.map((index, value) => {
    if(obj[index] < 1) {
      return `+${Math.floor(obj[index] * 100)}%  ${index}`;
    }
    else if (index === 'Damage') {
      return `+${obj[index]}% Increased Weapon ${index}`;
    }
    else {
      return `+${obj[index]} ${index}`;
    }
  });
}

const createComponent = (type, children, classArr = []) => {
  let newElement = document.createElement(type);
  classArr.forEach((cssClass) =>
    newElement.setAttribute('class', cssClass)
  )
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

const createDamArmString = (arr, obj) => {
  if(arr === 'weapon') {
    return `Damage: ${obj.minDam}  -  ${obj.maxDam} ${obj.elemMod.elemType} | Slot: ${obj.item.slot}`;
  }
  return `Armor: ${obj.armorValue} | Slot: ${obj.item.slot}`;
}

const determineRarity = (obj, arr) => {
  const namePanel = arr[0];
	const elemModName = obj.elemMod.name;
	const prefixName = obj.prefix.name;
	const suffixName = obj.suffix.name;
  if(elemModName || prefixName || suffixName) {
    let color = '#206720';
    if(elemModName && prefixName || elemModName && suffixName ||
    prefixName && suffixName) {
      color = '#2424a2';
    }
    if(elemModName && prefixName && suffixName) {
      color = 'Purple';
      if(obj.qualityLevel >= 1000) {
        color = '#d35d13';
      }
    }
		namePanel.style.backgroundColor = color;
  }
}

gId('itemGen').addEventListener('click', () => {
  $.ajax({
    url: "/weapon",
    dataType: "json"
  })
  .done(function(data) {
    gId('weaponContainer').innerHTML = '';
    const weaponDiv = document.createElement('div');
    for(let i = 0; i < 6; i++) {
      const itemTypeValue = randomNum(0, (Object.keys(data.itemTypes).length - 1));
      console.log("=========================");
      console.log("Data for " + Object.keys(data.itemTypes)[itemTypeValue] + " #" + (i + 1));
      console.log("=========================");
      const itemProps = [];
      const newItem = generateWeapon(data, Object.keys(data.itemTypes)[itemTypeValue]);
      const wName = createComponent('p', [newItem.name], ['wName']);
      itemProps.push(wName);
      determineRarity(newItem, itemProps);

      const weaponDam = createComponent('p', [createDamArmString(newItem.item.type, newItem)]);
      itemProps.push(weaponDam);

      if(Object.keys(newItem.modifiers).length > 0) {
        const mods = prettifyModifiers(Object.keys(newItem.modifiers), newItem.modifiers);
        const wStat = createComponent('div', mods.map((mod) => createComponent('p', [mod], ['modString'])), ['stat-container']);
        itemProps.push(wStat);
      }

      const wCost = createComponent('p', [`Cost: ${newItem.cost.toLocaleString()} g`]);
      itemProps.push(wCost);

      const innerContainer = createComponent('div', itemProps, ['weaponContainer']);
      weaponDiv.appendChild(innerContainer);
    }
    gId('weaponContainer').appendChild(weaponDiv);
  })
});
