import type { GpxPointExtensions } from './GpxPointExtensions';

export interface GpxRoutePoint {
    lat: number;
    lon: number;
    elevation?: number;
    time?: Date;
    extensions?: GpxPointExtensions;
}

