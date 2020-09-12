export interface BladeParams {
    /**
     * Vertex colors
     *
     * Accepts:
     * Hex strings - "#ffb900"
     * Number Arrays - [225, 185, 0]
     * ThreeJs Color Objects
     */
    color?: number | string;

    /**
     * Cross section used during generation
     */
    crossSection?: string;

    /**
     * Percentage of the blade devoted to the tip of the blade
     */
    bladeBaseProportion?: number;

    /**
     * Percentage of the blade devoted to the middle of the blade
     */
    bladeMidProportion?: number;

        /**
     * Number of control points for the spline that defines
     * the edge geometry at the base of the blade
     */
    baseSplineControlPoints?: number

    /**
     * Number of control points for the spline that defines
     * the edge geometry at the middle of the blade
     */
    midSplineControlPoints?: number

    /**
     * Number of control points for the spline that defines
     * the edge geometry at the tip of the blade
     */
    tipSplineControlPoints?: number

    /**
     * If true, the number of control points for each section
     * of the blade will be determined randomly
     */
    randomNumControlPoints?: boolean;

    /**
     * Minimum number of control points
     * @note Only used when randomNumControlPoints is true
     */
    maxSplineControlPoints?: number;

    /**
     * Minimum number of control points
     * @note Only used when randomNumControlPoints is true
     */
    minSplineControlPoints?: number;

    /**
     * Base section spline sample resolution [0,1]
     */
    baseSplineSampleRes?: number;

    /**
     * Mid section spline sample resolution [0,1)
     */
    midSplineSampleRes?: number;

    /**
     * Tip section spline sample resolution [0,1)
     */
    tipSplineSampleRes?: number;

    /**
     * Should the control points be spaced evenly along
     * the length of the base section of the blade
     */
    evenSpacedBaseCPs?: boolean;

    /**
     * Should the control points be spaced evenly along
     * the length of the mid section of the blade
     */
    evenSpacedMidCPs?: boolean;

    /**
     * Should the control points be spaced evenly along
     * the length of the tip section of the blade
     */
    evenSpacedTipCPs?: boolean;

    /**
     * Max deviation of the width of the blade
     * from the template
     */
    edgeScaleTolerance?: number;
};

export interface GuardParams {
    color?: number | string;
    crossSection?: string;
    thickness?: number;
    guardBladeRatio?: number;
};

export interface HandleParams {
    color?: number | string;
    crossSection?: string;
    length?: number;
    radius?: number;
    hands?: number;
};

export interface PommelParams {
    /**
     * Vertex color
     */
    color?: number | string;

    /**
     * Ratio of the pommel to the base blade width
     */
    pommelBladeWidthRatio?: number
};

export interface SwordGenerationParams {

    /**
     * Final output of call to generate
     * (defaults to 'gltf')
     */
    output?: "gltf" | "mesh";

    /**
     * Style of sword to produce
     */
    template?: string;

    /**
     * Seed for the pseudo random number generator
     */
    seed?: string

    /**
     * Parameters for blade generation
     */
    bladeParams?: BladeParams;

    /**
     * Parameters for guard generation
     */
    guardParams?: GuardParams;

    /**
     * Parameters for handle generation
     */
    handleParams?: HandleParams;

    /**
     * Parameters for pommel generation
     */
    pommelParams?: PommelParams;
};
