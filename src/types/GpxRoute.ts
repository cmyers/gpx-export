import type { GpxPointExtensions } from './GpxPointExtensions';
import type { GpxRoutePoint } from './GpxRoutePoint';

export interface GpxRoute {
    name?: string;
    cmt?: string;
    desc?: string;
    points: GpxRoutePoint[];
    extensions?: GpxPointExtensions;
}

