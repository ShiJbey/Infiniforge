/**
 * Template parameters for building
 * swords within the generator.
 *
 * @note Units are measured in meters
 */
export interface SwordTemplate {
    name?: string;
    hands: number;
    baseBladeWidth: number;
    minBladeLength: number;
    maxBladeLength: number;
    minHandleLength: number;
    maxHandleLength: number;
    bladeThickness: number;
}

export const LONG_SWORD:  SwordTemplate = {
    "baseBladeWidth": 0.1,
    "minBladeLength": 0.80,
    "maxBladeLength": 1,
    "minHandleLength": 0.16,
    "maxHandleLength": 0.28,
    "hands": 2,
    "bladeThickness": 0.05
}

export const SHORT_SWORD: SwordTemplate = {
    "baseBladeWidth": 0.1,
    "minBladeLength": 0.5,
    "maxBladeLength": 0.5,
    "minHandleLength": 0.3,
    "maxHandleLength": 0.4,
    "hands": 1,
    "bladeThickness": 0.05
}

export const GREAT_SWORD: SwordTemplate = {
    "baseBladeWidth": 0.5,
    "minBladeLength": 0.9,
    "maxBladeLength": 1.1,
    "minHandleLength": 0.3,
    "maxHandleLength": 0.5,
    "hands": 2,
    "bladeThickness": 0.05
}

export const SWORD_TEMPLATES: any = {
    "short": SHORT_SWORD,
    "long": LONG_SWORD,
    "great": GREAT_SWORD
}

export function getTemplate(style: string) {
    if (isSupportedTemplate(style)) {
        return SWORD_TEMPLATES[style] as SwordTemplate;
    }
}

export function isSupportedTemplate(style: string) {
    return Object.keys(SWORD_TEMPLATES).indexOf(style) >= 0;
}
