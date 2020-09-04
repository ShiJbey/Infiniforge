/**
 * These are template parameters for all of the
 * different supported swords within the generator.
 * The units are measured in meters
 */
export interface SwordTemplate {
    style : string;
    baseBladeWidth : number;    // Width of the blade, from edge to edge, at the handle
    minBladeLength: number;
    maxBladeLength: number;
    minHandleLength: number;
    maxHandleLength: number;
}

export const templates: SwordTemplate[] = [
    {
        "style": "short",
        "baseBladeWidth": 0.2,
        "minBladeLength": 0.5,
        "maxBladeLength": 0.5,
        "minHandleLength": 0.3,
        "maxHandleLength": 0.4
    },
    {
        "style": "long",
        "baseBladeWidth": 0.2,
        "minBladeLength": 0.85,
        "maxBladeLength": 1.1,
        "minHandleLength": 0.16,
        "maxHandleLength": 0.28
    },
    {
        "style": "great",
        "baseBladeWidth": 0.5,
        "minBladeLength": 1.5,
        "maxBladeLength": 2.0,
        "minHandleLength": 0.5,
        "maxHandleLength": 1.0
    }
]

export function getSwordTemplate(style: string) {
    for (let i = 0; i < templates.length; i++) {
        if (templates[i].style == style) {
            return templates[i];
        }
    }
}

export default { getSwordTemplate };
