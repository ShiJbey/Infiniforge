export interface BladeParams {
    color?: number | string;
    crossSection?: string;
    bladeBaseProportion?: number;
    bladeMidProportion?: number;
    baseSplineControlPoints?: number;
    midSplineControlPoints?: number;
    tipSplineControlPoints?: number;
    randomNumControlPoints?: boolean;
    maxSplineControlPoints?: number;
    minSplineControlPoints?: number;
    baseSplineSamples?: number;
    midSplineSamples?: number;
    tipSplineSamples?: number;
    evenSpacedBaseCPs?: boolean;
    evenSpacedMidCPs?: boolean;
    evenSpacedTipCPs?: boolean;
    edgeScaleTolerance?: number;
}
export interface GuardParams {
    color?: number | string;
    crossSection?: string;
    thickness?: number;
    guardBladeRatio?: number;
}
export interface HandleParams {
    color?: number | string;
    crossSection?: string;
    length?: number;
    radius?: number;
}
export interface PommelParams {
    color?: number | string;
    pommelBladeWidthRatio?: number;
}
export interface SwordGenerationParams {
    output?: "gltf" | "mesh";
    template?: string;
    seed?: string;
    bladeParams?: BladeParams;
    guardParams?: GuardParams;
    handleParams?: HandleParams;
    pommelParams?: PommelParams;
}
