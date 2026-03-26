import type { GpxAuthor } from './GpxAuthor';
import type { GpxBounds } from './GpxBounds';
import type { GpxCopyright } from './GpxCopyright';
import type { GpxLink } from './GpxLink';

export interface GpxMetadata {
    name?: string;
    desc?: string;
    author?: GpxAuthor;
    link?: GpxLink;
    time?: Date;
    keywords?: string;
    /**
     * Backward compatible shorthand:
     * - string => rendered as <copyright author="..." />
     * - object => full GPX 1.1 copyright structure
     */
    copyright?: string | GpxCopyright;
    bounds?: GpxBounds;
}

