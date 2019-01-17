(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WeaponTemplates = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}]},{},[1])(1)
});
