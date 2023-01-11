import * as THREE from "three";
import * as utils from "../../utilities/utils";
import Generator from "../Generator";
import { SwordTemplate, SWORD_TEMPLATES } from "./SwordTemplate";
import { BladeCrossSection, BLADE_CROSS_SECTIONS } from "./BladeCrossSection";
import {
  BladeParams,
  HandleParams,
  GuardParams,
  PommelParams,
  SwordGenerationParams,
} from "./SwordGenerationParams";
import GeometryData from "../../modeling/GeometryData";
import { CrossSection } from "../../modeling/CrossSection";
import BladeGeometry from "./BladeGeometry";

export default class SwordGenerator extends Generator<SwordGenerationParams> {
  constructor(verbose = false) {
    super(verbose);
  }

  /**
   * Generate a new sword
   *
   * @param params
   * @return
   */
  generate(params: SwordGenerationParams): Promise<object> {
    if (params.seed) {
      this.setSeed(params.seed);
    }

    const template = this.getSwordTemplate(params.template);

    const sword = new GeometryData();

    this.buildBlade(sword, template, params.bladeParams);
    this.buildGuard(sword, template, params.guardParams);
    this.buildHandle(sword, template, params.handleParams);
    this.buildPommel(sword, template, params.pommelParams);

    if (params.output === "mesh") {
      return new Promise((resolve) => resolve(sword.toMesh()));
    }

    return sword.toGlTF(this.verbose);
  }

  generateMesh(params: SwordGenerationParams): THREE.Mesh {
    if (params.seed) {
      this.setSeed(params.seed);
    }

    const template = this.getSwordTemplate(params.template);

    const sword = new GeometryData();

    this.buildBlade(sword, template, params.bladeParams);
    this.buildGuard(sword, template, params.guardParams);
    this.buildHandle(sword, template, params.handleParams);
    this.buildPommel(sword, template, params.pommelParams);

    return sword.toMesh();
  }

  private getSwordTemplate(templateName?: string): SwordTemplate {
    if (templateName) {
      if (templateName === "random") {
        return this.getRandomTemplate();
      }
      const template = SWORD_TEMPLATES[templateName];
      if (template) {
        return template;
      }
      throw new Error(`Invalid sword template '${templateName}'`);
    }

    return this.getRandomTemplate();
  }

  private getBladeCrossSection(crossSectionName?: string): BladeCrossSection {
    if (crossSectionName) {
      if (crossSectionName === "random") {
        return this.getRandomBladeCrossSection();
      }
      const crossSection = BLADE_CROSS_SECTIONS[crossSectionName];
      if (crossSection) {
        return crossSection;
      }
      throw new Error(`Invalid blade cross-section '${crossSectionName}'`);
    }

    return this.getRandomBladeCrossSection();
  }

  private getRandomTemplate(): SwordTemplate {
    const randomIndex = utils.getRandomInt(
      this.prng,
      0,
      Object.keys(SWORD_TEMPLATES).length - 1
    );
    const crossSectionName = Object.keys(SWORD_TEMPLATES)[randomIndex];
    return SWORD_TEMPLATES[crossSectionName];
  }

  private getRandomBladeCrossSection(): BladeCrossSection {
    const randomIndex = utils.getRandomInt(
      this.prng,
      0,
      Object.keys(BLADE_CROSS_SECTIONS).length - 1
    );
    const crossSectionName = Object.keys(BLADE_CROSS_SECTIONS)[randomIndex];
    return BLADE_CROSS_SECTIONS[crossSectionName];
  }

  private randomTip(): string {
    const randomIndex = utils.getRandomInt(
      this.prng,
      0,
      Object.keys(BladeGeometry.TIP_GEOMETRIES).length - 1
    );
    return BladeGeometry.TIP_GEOMETRIES[randomIndex];
  }

  /**
   * Generates geometry data for the blade of the sword
   *
   * @param sword
   * @param params
   */
  private buildBlade(
    sword: GeometryData,
    template: SwordTemplate,
    params?: BladeParams
  ): void {
    const determineTip = (tipStyle?: string): string => {
      if (tipStyle) {
        if (tipStyle === "random") {
          return this.randomTip();
        }
        return tipStyle;
      }
      return "standard";
    };

    const color = params?.color ?? "rgb(128, 128, 128)";
    let tip = determineTip(params?.tip);
    let edgeScaleTolerance = params?.edgeScaleTolerance ?? 0.1;
    const randomNumControlPoints = params?.randomNumControlPoints ?? false;
    const minSplineControlPoints = params?.minSplineControlPoints ?? 2;
    const maxSplineControlPoints = params?.maxSplineControlPoints ?? 7;
    const evenSpacedBaseCPs = params?.evenSpacedBaseCPs ?? false;
    const evenSpacedMidCPs = params?.evenSpacedMidCPs ?? false;
    const evenSpacedTipCPs = params?.evenSpacedTipCPs ?? false;
    const baseSplineSamples = params?.baseSplineSamples ?? 8;
    const midSplineSamples = params?.baseSplineSamples ?? 4;
    const tipSplineSamples = params?.baseSplineSamples ?? 4;
    const baseSplineControlPoints = params?.baseSplineControlPoints ?? 7;
    const midSplineControlPoints = params?.baseSplineControlPoints ?? 5;
    const tipSplineControlPoints = params?.baseSplineControlPoints ?? 5;
    const bladeBaseProportion = params?.bladeBaseProportion ?? 0.4;
    const bladeMidProportion = params?.bladeMidProportion ?? 0.45;
    let crossSection = this.getBladeCrossSection(params?.crossSection);

    /// //////////////////////////////////////////////////////////////
    //                    BLADE SECTION LENGTHS                    //
    /// //////////////////////////////////////////////////////////////

    if (bladeBaseProportion + bladeMidProportion > 1.0) {
      throw new Error(
        "Blade middle and base section proportions larger than 1.0"
      );
    }

    const bladeLength = utils.getRandomFloat(
      this.prng,
      template.minBladeLength,
      template.maxBladeLength
    );

    const baseSectionLength = bladeLength * bladeBaseProportion;

    const midSectionLength = bladeLength * bladeMidProportion;

    const tipSectionLength =
      bladeLength - (baseSectionLength + midSectionLength);

    /// //////////////////////////////////////////////////////////////
    //                        BUILD SECTIONS                       //
    /// //////////////////////////////////////////////////////////////

    let edgeSpline: THREE.SplineCurve;

    if (template.name === "katana") {
      crossSection = this.getBladeCrossSection("single_edge");
      tip = "clip";
      edgeScaleTolerance = 0;

      edgeSpline = new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1),
      ]);
    } else {
      let nControlPoints = baseSplineControlPoints;

      if (randomNumControlPoints) {
        nControlPoints = utils.getRandomInt(
          this.prng,
          minSplineControlPoints,
          maxSplineControlPoints
        );
      }

      edgeSpline = this.CreateEdgeSpline(
        nControlPoints,
        edgeScaleTolerance,
        evenSpacedBaseCPs
      );
    }

    const bladeGeometry = new BladeGeometry(
      bladeLength,
      template.extrusionCurve
    )
      .setBladeCrossSection(
        new CrossSection(crossSection),
        crossSection.edgeVertices,
        new THREE.Color(color),
        crossSection.normEdgeVertices ?? [],
        true
      )
      // Scale the cross section to fit the template
      .scale(
        new THREE.Vector2(
          template.bladeThickness / crossSection.thickness,
          template.baseBladeWidth / crossSection.width
        )
      )
      // Extrude the base section of the blade
      .extrudeSection(edgeSpline, baseSplineSamples, baseSectionLength, 0.2)
      // Extrude the mid section of the blade
      // .extrude(midSectionLength)
      .extrudeSection(
        new THREE.SplineCurve([
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0, 1),
        ]),
        midSplineSamples,
        midSectionLength,
        0.3
      )
      // Scale down the cross-section
      // .scale(0.7)
      // Create blade tip
      .createTip(tip, tipSectionLength);

    sword.add(bladeGeometry);
  }

  /**
   * Creates a box-shaped guard and merges it with the swords geometry.
   *
   * @param sword
   * @param params
   */
  private buildGuard(
    sword: GeometryData,
    template: SwordTemplate,
    params?: GuardParams
  ): void {
    const DEFAULT_PARAMS: GuardParams = {
      color: "#7f5100",
      thickness: 0.01,
      guardBladeRatio: 1.5,
    };

    params = Object.assign(DEFAULT_PARAMS, params);

    const guardGeometry = new THREE.BoxGeometry(
      template.bladeThickness + 0.04,
      params.thickness,
      0.06 + template.baseBladeWidth
    );

    const guardGeometryData = new GeometryData().fromGeometry(
      guardGeometry,
      new THREE.Color(params.color)
    );

    sword.add(guardGeometryData);
  }

  /**
   * Creates a cylindrical handle and merges it with the swords geometry.
   *
   * @param sword
   * @param params
   */
  private buildHandle(
    sword: GeometryData,
    template: SwordTemplate,
    params?: HandleParams
  ): void {
    const color = params?.color ?? "#cc5100";
    const radius = params?.radius ?? 0.015;

    const handlesCsShape = new THREE.Shape().setFromPoints(
      new THREE.EllipseCurve(
        0,
        0,
        radius,
        radius * 2,
        0,
        2 * Math.PI, // aStartAngle, aEndAngle
        false, // aClockwise
        0 // aRotation
      ).getPoints(8)
    );

    const handleGeometryData = new GeometryData()
      .setCrossSection(
        CrossSection.createFromShape(handlesCsShape),
        new THREE.Color(color)
      )
      .translate(-template.handleLength);

    if (template.name !== "katana") {
      handleGeometryData.scale(1.0 / 2.0);
    }

    handleGeometryData.extrude(new THREE.Vector3(0, template.handleLength, 0));

    if (template.name !== "katana") {
      handleGeometryData.scale(2);
    }

    sword.add(handleGeometryData);
  }

  /**
   * Creates a spherical pommel and merges it with the swords geometry.
   *
   * @param sword
   * @param params
   */
  private buildPommel(
    sword: GeometryData,
    template: SwordTemplate,
    params?: PommelParams
  ): void {
    const color = params?.color ?? "#e5cc59";
    const pommelBladeWidthRatio = params?.pommelBladeWidthRatio ?? 0.5;
    const pommelRadius = 0.03;

    const geometry = new THREE.SphereGeometry(pommelRadius, 5, 5);

    // Translates the pommel to fall below the handle
    geometry.translate(0, -template.handleLength, 0);

    // Convert the box to a buffer geometry
    let pommelGeometryData = new GeometryData().fromGeometry(
      geometry,
      new THREE.Color(color)
    );

    if (template.name === "katana") {
      const pommelCsShape = new THREE.Shape().setFromPoints(
        new THREE.EllipseCurve(
          0,
          0,
          0.016,
          0.016 * 2,
          0,
          2 * Math.PI, // aStartAngle, aEndAngle
          false, // aClockwise
          0 // aRotation
        ).getPoints(8)
      );

      pommelGeometryData = new GeometryData()
        .setCrossSection(
          CrossSection.createFromShape(pommelCsShape),
          new THREE.Color(color)
        )
        .translate(-template.handleLength)
        .fill()
        .extrude(new THREE.Vector3(0, 0.03, 0));
    }

    // Add the pommel's geometry data to the sword
    sword.add(pommelGeometryData);
  }

  /**
   * Creates a SplineCurve for edge geometry
   *
   * @param nPoints Number of points in the curve not including ends
   */
  private CreateEdgeSpline(
    nPoints: number,
    widthTolerance: number,
    evenSpacing = true
  ): THREE.SplineCurve {
    if (nPoints < 0) {
      throw new Error("Invalid number of points to create spline curve");
    }

    // Spline points are defined on the interval [0,1]
    // and are defined along the positive y-axis.
    // The  x-values of the points along the curve represent
    // the width of the blade's edge when measured from
    // the center of the cross-section

    const splinePoints: THREE.Vector2[] = [new THREE.Vector2(0, 0)];

    // Spacings are the vertical distance between control points on the spline curve
    const spacing = utils.divideValue(1.0, nPoints + 1, evenSpacing, this.prng);

    let totalSpacing = 0;

    for (let i = 0; i < spacing.length; i++) {
      // Space the point vertically
      const point = new THREE.Vector2();
      if (i === spacing.length - 1) {
        point.y = 1.0;
        point.x = 0.0;
      } else {
        totalSpacing += spacing[i];
        point.y = totalSpacing;
        point.x = utils.getRandomFloat(
          this.prng,
          -widthTolerance,
          widthTolerance
        );
      }
      splinePoints.push(point);
    }

    return new THREE.SplineCurve(splinePoints);
  }
}
