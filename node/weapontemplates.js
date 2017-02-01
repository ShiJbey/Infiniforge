// JS Object that organizes the supported styles under type names
const SupportedWeapons = {
    "sword":{
        "short": {"baseWidth":.2, "widthMarginRatio":.1, "length":1.5},
        "long": {"baseWidth":.2, "widthMarginRatio":.1, "length":2.2},
        "great": {"baseWidth":.3, "widthMarginRatio":.1, "length":2.75}
    }
}

// Check if  an array contains a particular function
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

function isSupportedWeapon(weaponType, weaponStyle) {
    validType = objContains(SupportedWeapons, weaponType);
    if (validType) {
        if (objContains(SupportedWeapons[weaponType], weaponStyle)) {
            return true;
        }
    }
    return false;
}

module.exports.getWeaponTemplate = function(weaponType, weaponStyle) {
    if (!isSupportedWeapon(weaponType, weaponStyle)) {
        return null;
    }
    return SupportedWeapons[weaponType][weaponStyle];
}