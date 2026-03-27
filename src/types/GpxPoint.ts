import type { GpxPointExtensions } from './GpxPointExtensions';

export interface GpxPoint {
    lat: number;
    lon: number;
    time: Date;
    /** Speed in m/s — written as gpxtpx:speed (Garmin TrackPointExtension v2) */
    speed?: number;
    /** Elevation in metres — written as standard GPX <ele> */
    elevation?: number;
    extensions?: GpxPointExtensions;
}
