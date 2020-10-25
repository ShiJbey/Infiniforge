import { Generator } from '../Generator';
import { SwordGenerationParams } from './SwordGenerationParams';
export declare class SwordGenerator extends Generator {
    constructor(verbose?: boolean);
    generate(params: SwordGenerationParams): Promise<any>;
    private getSwordTemplate;
    private getBladeCrossSection;
    private getRandomTemplate;
    private getRandomBladeCrossSection;
    private buildBlade;
    private buildGuard;
    private buildHandle;
    private buildPommel;
    private CreateEdgeSpline;
}
