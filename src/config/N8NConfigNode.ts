import { AuthProperties } from "../models/AuthProperties";

export class N8NConfigNode {
    public positionsPath: number[] = [];
    public globalAuth: AuthProperties | null = null;
    public defaultTypeResponse: string = '';
}