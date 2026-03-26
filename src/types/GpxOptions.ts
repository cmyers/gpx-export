import type { GpxBounds } from './GpxBounds';
import type { GpxMetadata } from './GpxMetadata';
import type { GpxRoute } from './GpxRoute';
import type { GpxWaypoint } from './GpxWaypoint';

export interface GpxOptions {
    /** Value written to the GPX creator attribute. Defaults to 'gpx-export' */
    creator?: string;
    metadata?: GpxMetadata;
    waypoints?: GpxWaypoint[];
    routes?: GpxRoute[];
    bounds?: GpxBounds;
    /** Trusted raw XML inserted into root <extensions> without escaping */
    extensionsXml?: string;
}

