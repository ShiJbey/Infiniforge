export interface BladeCrossSection {
    name: string;
    vertices: number[];
    edgeVertices: number[];
    width: number;
    thickness: number;
}
export declare const DIAMOND: BladeCrossSection;
export declare const HALLOW_GROUND: BladeCrossSection;
export declare const HEXAGONAL: BladeCrossSection;
export declare const THICKENED_DIAMOND: BladeCrossSection;
export declare const LENTICULAR: BladeCrossSection;
export declare const FULLER: BladeCrossSection;
export declare const DOUBLE_FULLER: BladeCrossSection;
export declare const BROAD_FULLER: BladeCrossSection;
export declare const BLADE_CROSS_SECTIONS: any;
export declare function getCrossSection(style: string): BladeCrossSection | undefined;
export declare function isSupportedCrossSection(style: string): boolean;
