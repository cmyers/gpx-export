import type { GpxPoint } from './GpxPoint';
import type { GpxPointExtensions } from './GpxPointExtensions';
import type { GpxTrackSegment } from './GpxTrackSegment';

export interface GpxTrack {
    name: string;
    /** Defaults to the time of the first point when omitted */
    createdAt?: Date;
    points?: GpxPoint[];
    segments?: GpxTrackSegment[];
    cmt?: string;
    desc?: string;
    extensions?: GpxPointExtensions;
}

