// These are template parameters for all of the different supported swords
// within the generator. The units are general, however, when exporting to
// an engine such as Unity,
export interface SwordTemplate {
    style : string;
    baseBladeWidth : number;    // Width of the blade, from edge to edge, at the handle
    minBladeLength: number;
    maxBladeLength: number;
    minHandleLength: number;
    maxHandleLength: number;
}

// These are measured in meters. Morphologies sourced from:
// https://en.wikipedia.org/wiki/Longsword
export const SupportedSwords = new Map<string, SwordTemplate>([
    ["short", {
        "style": "short",
        "baseBladeWidth": 0.2,
        "minBladeLength": 0.5,
        "maxBladeLength": 0.5,
        "minHandleLength": 0.3,
        "maxHandleLength": 0.4
    }],
    ["long", {
        "style": "long",
        "baseBladeWidth": 0.3,
        "minBladeLength": 0.85,
        "maxBladeLength": 1.1,
        "minHandleLength": 0.16,
        "maxHandleLength": 0.28
    }],
    ["great", {
        "style": "short",
        "baseBladeWidth": 0.5,
        "minBladeLength": 1.5,
        "maxBladeLength": 2.0,
        "minHandleLength": 0.5,
        "maxHandleLength": 1.0
    }]
]);

export function isSupportedSword(swordStyle: string): boolean {
    return SupportedSwords.has(swordStyle);
}

export function getSwordTemplate(swordStyle: string): SwordTemplate | undefined {
    return SupportedSwords.get(swordStyle);
}
