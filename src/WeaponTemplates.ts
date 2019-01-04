// Defines what weapons are currently suppoted in the game
/*
interface WeaponTemplate {
    baseWidth : number;
    widthMarginRation : number;
    length : number;
}

const SupportedWeapons = {
    "sword":{
        "short": {"baseWidth":.2, "widthMarginRatio":.1, "length":5},
        "long": {"baseWidth":.2, "widthMarginRatio":.1, "length":3},
        "great": {"baseWidth":.3, "widthMarginRatio":.1, "length":7}
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
function isSupportedWeapon(weaponType: string, weaponStyle: string) : boolean {
    if (SupportedWeapons[weaponType]) {

    }

    var validType : boolean = objContains(SupportedWeapons, weaponType);
    if (validType) {
        if (objContains(SupportedWeapons[weaponType], weaponStyle)) {
            return true;
        }
    }
    return false;
}

// Exports a function that allows one to query for weapon templates
// within Supported weapons
module.exports.getWeaponTemplate = function(weaponType: string, weaponStyle: string) {
    if (!isSupportedWeapon(weaponType, weaponStyle)) {
        return undefined;
    }
    return SupportedWeapons[weaponType][weaponStyle];
}
*/