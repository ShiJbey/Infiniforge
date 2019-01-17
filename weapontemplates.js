// Defines what weapons are currently suppoted in the game
const SupportedWeapons = {
    "sword":{
        "short": {"baseWidth": 0.2, "widthMarginRatio":.1, "length":0.5},
        "long": {"baseWidth": 0.3, "widthMarginRatio":.1, "length":2},
        "great": {"baseWidth": 0.5, "widthMarginRatio":.1, "length":3}
    }
}

// Check if  an array contains a particular value
function arrayContains(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (val == arr[i]) {
            return true;
        }
    }
    return false;
}

// Returns whether or not an object has a property matching
// a given property Name
function objContains(obj, propName) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (prop == propName) {
                return true;
            }
        }
    }
    return false;
}

// Checks if the given weapon type and style are contained within
// the SuppertedWeapons object
function isSupportedWeapon(weaponType, weaponStyle) {
    validType = objContains(SupportedWeapons, weaponType);
    if (validType) {
        if (objContains(SupportedWeapons[weaponType], weaponStyle)) {
            return true;
        }
    }
    return false;
}

// Exports a function that allows one to query for weapon templates
// within Supported weapons
function getWeaponTemplate(weaponType, weaponStyle) {
    if (!isSupportedWeapon(weaponType, weaponStyle)) {
        return null;
    }
    return SupportedWeapons[weaponType][weaponStyle];
}

module.exports.getWeaponTemplate = getWeaponTemplate;