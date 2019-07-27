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

import * as templates from './json/sword-templates.json';

export function isValidTemplate(swordStyle: string ): boolean {
    if (swordStyle in templates['sword']) {
        return true;
    }
    return false;
}

export function getSwordTemplate(swordStyle: string): any {
    if (!isValidTemplate(swordStyle)) {
        throw new Error('No valid sword template available');
    }
    else {
        return (<any>templates)['sword'][swordStyle];
    }
}

export { templates as SwordTemplates };