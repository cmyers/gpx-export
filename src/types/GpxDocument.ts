import type { GpxMetadata } from './GpxMetadata';
import type { GpxRoute } from './GpxRoute';
import type { GpxTrack } from './GpxTrack';
import type { GpxWaypoint } from './GpxWaypoint';

export interface GpxDocument {
    metadata?: GpxMetadata;
    waypoints?: GpxWaypoint[];
    routes?: GpxRoute[];
    tracks?: GpxTrack[];
}

