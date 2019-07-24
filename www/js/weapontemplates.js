(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WeaponTemplates = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// These are template parameters for all of the different supported swords
// within the generator. The units are general, however, when exporting to
// an engine suh as Unity, these are measured in meters. Morphologies sourced
// from:
// https://en.wikipedia.org/wiki/Longsword
const SupportedWeapons = {
    "sword":{
        "short": {
            "style": "short",
            "baseBladeWidth": 0.2,
            "minBladeLength": 0.5,
            "maxBladeLength": 0.5,
            "minHandleLength": 0.3,
            "maxHandleLength": 0.4
        },
        "long": {
            "style": "long",
            "baseBladeWidth": 0.3,
            "minBladeLength": 0.85,
            "maxBladeLength": 1.1,
            "minHandleLength": 0.16,
            "maxHandleLength": 0.28
        },
        "great": {
            "style": "short",
            "baseBladeWidth": 0.5,
            "minBladeLength": 1.5,
            "maxBladeLength": 2.0,
            "minHandleLength": 0.5,
            "maxHandleLength": 1.0
        }
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
module.exports.isSupportedWeapon = isSupportedWeapon;

},{}]},{},[1])(1)
});
