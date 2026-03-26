import type { GpxPointExtensions } from './GpxPointExtensions';

export interface GpxWaypoint {
    lat: number;
    lon: number;
    name?: string;
    cmt?: string;
    desc?: string;
    elevation?: number;
    time?: Date;
    extensions?: GpxPointExtensions;
}

