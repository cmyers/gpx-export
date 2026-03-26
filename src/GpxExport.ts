// GpxExport — zero-dependency GPX 1.1 generator with Garmin TrackPointExtension v2 support

import type {
    GpxBounds,
    GpxDocument,
    GpxLink,
    GpxMetadata,
    GpxOptions,
    GpxPoint,
    GpxPointExtensions,
    GpxRoute,
    GpxRoutePoint,
    GpxTrack,
    GpxTrackSegment,
    GpxWaypoint,
} from './types';

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function indentLines(lines: string[], level: number): string[] {
    const indent = '  '.repeat(level);
    return lines.map((line) => `${indent}${line}`);
}

function xmlTag(name: string, value: string): string {
    return `<${name}>${escapeXml(value)}</${name}>`;
}

function xmlTagNumber(name: string, value: number, precision?: number): string {
    const rendered = precision !== undefined ? value.toFixed(precision) : String(value);
    return `<${name}>${rendered}</${name}>`;
}

function toIso(value?: Date): string | undefined {
    return value ? value.toISOString() : undefined;
}

function hasValue(value: string | undefined): value is string {
    return Boolean(value && value.length > 0);
}

function resolveTrackSegments(track: GpxTrack): GpxTrackSegment[] {
    if (track.segments && track.segments.length > 0) {
        return track.segments;
    }
    return [{ points: track.points ?? [] }];
}

function normalizePointExtensions(legacySpeed: number | undefined, extensions: GpxPointExtensions | undefined): GpxPointExtensions | undefined {
    const normalized: GpxPointExtensions = {
        speed: extensions?.speed ?? legacySpeed,
        heartRate: extensions?.heartRate,
        cadence: extensions?.cadence,
        rawXml: extensions?.rawXml,
    };

    if (
        normalized.speed === undefined
        && normalized.heartRate === undefined
        && normalized.cadence === undefined
        && !hasValue(normalized.rawXml)
    ) {
        return undefined;
    }

    return normalized;
}

function hasGarminPointExtensions(ext: GpxPointExtensions | undefined): boolean {
    return Boolean(ext?.speed !== undefined || ext?.heartRate !== undefined || ext?.cadence !== undefined);
}

function renderBounds(bounds: GpxBounds): string {
    return `<bounds minlat="${bounds.minLat}" minlon="${bounds.minLon}" maxlat="${bounds.maxLat}" maxlon="${bounds.maxLon}" />`;
}

function renderLink(link: GpxLink): string[] {
    const lines: string[] = [`<link href="${escapeXml(link.href)}">`];
    if (link.text) {
        lines.push(`  ${xmlTag('text', link.text)}`);
    }
    if (link.type) {
        lines.push(`  ${xmlTag('type', link.type)}`);
    }
    lines.push(`</link>`);
    return lines;
}

function renderMetadata(metadata: GpxMetadata | undefined): string[] {
    if (!metadata) {
        return [];
    }

    const lines: string[] = ['<metadata>'];
    if (metadata.name) {
        lines.push(`  ${xmlTag('name', metadata.name)}`);
    }
    if (metadata.desc) {
        lines.push(`  ${xmlTag('desc', metadata.desc)}`);
    }
    if (metadata.author) {
        lines.push(`  <author>`);
        lines.push(`    ${xmlTag('name', metadata.author.name)}`);
        if (metadata.author.link) {
            lines.push(...indentLines(renderLink(metadata.author.link), 2));
        }
        lines.push(`  </author>`);
    }
    if (metadata.copyright) {
        if (typeof metadata.copyright === 'string') {
            lines.push(`  <copyright author="${escapeXml(metadata.copyright)}" />`);
        } else {
            lines.push(`  <copyright author="${escapeXml(metadata.copyright.author)}">`);
            if (metadata.copyright.year !== undefined) {
                lines.push(`    ${xmlTagNumber('year', metadata.copyright.year)}`);
            }
            if (metadata.copyright.license) {
                lines.push(`    ${xmlTag('license', metadata.copyright.license)}`);
            }
            lines.push(`  </copyright>`);
        }
    }
    if (metadata.link) {
        lines.push(...indentLines(renderLink(metadata.link), 1));
    }
    if (metadata.time) {
        lines.push(`  ${xmlTag('time', metadata.time.toISOString())}`);
    }
    if (metadata.keywords) {
        lines.push(`  ${xmlTag('keywords', metadata.keywords)}`);
    }
    if (metadata.bounds) {
        lines.push(`  ${renderBounds(metadata.bounds)}`);
    }
    lines.push('</metadata>');
    return lines;
}

function renderPointExtensions(extensions: GpxPointExtensions | undefined, level: number): string[] {
    if (!extensions) {
        return [];
    }

    const lines: string[] = ['<extensions>'];
    if (hasGarminPointExtensions(extensions)) {
        lines.push(`  <gpxtpx:TrackPointExtension>`);
        if (extensions.speed !== undefined) {
            lines.push(`    ${xmlTagNumber('gpxtpx:speed', extensions.speed, 4)}`);
        }
        if (extensions.heartRate !== undefined) {
            lines.push(`    ${xmlTagNumber('gpxtpx:hr', extensions.heartRate)}`);
        }
        if (extensions.cadence !== undefined) {
            lines.push(`    ${xmlTagNumber('gpxtpx:cad', extensions.cadence)}`);
        }
        lines.push(`  </gpxtpx:TrackPointExtension>`);
    }

    if (hasValue(extensions.rawXml)) {
        lines.push(extensions.rawXml);
    }
    lines.push('</extensions>');
    return indentLines(lines, level);
}

function renderTrackPoint(point: GpxPoint, level: number): string[] {
    const lines: string[] = [`<trkpt lat="${point.lat}" lon="${point.lon}">`];
    if (point.elevation !== undefined) {
        lines.push(`  ${xmlTagNumber('ele', point.elevation, 2)}`);
    }
    lines.push(`  ${xmlTag('time', point.time.toISOString())}`);

    const extensions = normalizePointExtensions(point.speed, point.extensions);
    lines.push(...renderPointExtensions(extensions, 1));
    lines.push('</trkpt>');
    return indentLines(lines, level);
}

function renderRoutePoint(point: GpxRoutePoint, level: number): string[] {
    const lines: string[] = [`<rtept lat="${point.lat}" lon="${point.lon}">`];
    if (point.elevation !== undefined) {
        lines.push(`  ${xmlTagNumber('ele', point.elevation, 2)}`);
    }
    const iso = toIso(point.time);
    if (iso) {
        lines.push(`  ${xmlTag('time', iso)}`);
    }
    lines.push(...renderPointExtensions(point.extensions, 1));
    lines.push('</rtept>');
    return indentLines(lines, level);
}

function renderWaypoint(waypoint: GpxWaypoint, level: number): string[] {
    const lines: string[] = [`<wpt lat="${waypoint.lat}" lon="${waypoint.lon}">`];
    if (waypoint.elevation !== undefined) {
        lines.push(`  ${xmlTagNumber('ele', waypoint.elevation, 2)}`);
    }
    const iso = toIso(waypoint.time);
    if (iso) {
        lines.push(`  ${xmlTag('time', iso)}`);
    }
    if (waypoint.name) {
        lines.push(`  ${xmlTag('name', waypoint.name)}`);
    }
    if (waypoint.cmt) {
        lines.push(`  ${xmlTag('cmt', waypoint.cmt)}`);
    }
    if (waypoint.desc) {
        lines.push(`  ${xmlTag('desc', waypoint.desc)}`);
    }
    lines.push(...renderPointExtensions(waypoint.extensions, 1));
    lines.push('</wpt>');
    return indentLines(lines, level);
}

function renderRoute(route: GpxRoute, level: number): string[] {
    const lines: string[] = ['<rte>'];
    if (route.name) {
        lines.push(`  ${xmlTag('name', route.name)}`);
    }
    if (route.cmt) {
        lines.push(`  ${xmlTag('cmt', route.cmt)}`);
    }
    if (route.desc) {
        lines.push(`  ${xmlTag('desc', route.desc)}`);
    }
    lines.push(...renderPointExtensions(route.extensions, 1));
    for (const point of route.points) {
        lines.push(...renderRoutePoint(point, 1));
    }
    lines.push('</rte>');
    return indentLines(lines, level);
}

function renderTrack(track: GpxTrack, level: number): string[] {
    const lines: string[] = ['<trk>'];
    lines.push(`  ${xmlTag('name', track.name)}`);
    if (track.cmt) {
        lines.push(`  ${xmlTag('cmt', track.cmt)}`);
    }
    if (track.desc) {
        lines.push(`  ${xmlTag('desc', track.desc)}`);
    }
    lines.push(...renderPointExtensions(track.extensions, 1));

    for (const segment of resolveTrackSegments(track)) {
        lines.push('  <trkseg>');
        for (const point of segment.points) {
            lines.push(...renderTrackPoint(point, 2));
        }
        lines.push('  </trkseg>');
    }
    lines.push('</trk>');
    return indentLines(lines, level);
}

function shouldUseGarminExtension(document: GpxDocument, rootExtensionsXml?: string): boolean {
    if (hasValue(rootExtensionsXml)) {
        return true;
    }

    const pointHasGarmin = (extensions: GpxPointExtensions | undefined): boolean => hasGarminPointExtensions(extensions);

    for (const waypoint of document.waypoints ?? []) {
        if (pointHasGarmin(waypoint.extensions)) {
            return true;
        }
    }

    for (const route of document.routes ?? []) {
        if (pointHasGarmin(route.extensions)) {
            return true;
        }
        for (const point of route.points) {
            if (pointHasGarmin(point.extensions)) {
                return true;
            }
        }
    }

    for (const track of document.tracks ?? []) {
        if (pointHasGarmin(track.extensions)) {
            return true;
        }
        for (const segment of resolveTrackSegments(track)) {
            for (const point of segment.points) {
                const normalized = normalizePointExtensions(point.speed, point.extensions);
                if (pointHasGarmin(normalized)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function mergeMetadata(base: GpxMetadata | undefined, incoming: GpxMetadata | undefined): GpxMetadata | undefined {
    if (!base && !incoming) {
        return undefined;
    }
    return {
        ...(base ?? {}),
        ...(incoming ?? {}),
    };
}

function normalizeDocument(document: GpxDocument, options: GpxOptions): GpxDocument {
    return {
        metadata: mergeMetadata(document.metadata, options.metadata),
        waypoints: [...(document.waypoints ?? []), ...(options.waypoints ?? [])],
        routes: [...(document.routes ?? []), ...(options.routes ?? [])],
        tracks: document.tracks ?? [],
    };
}

export function generateGpxDocument(document: GpxDocument, options: GpxOptions = {}): string {
    const normalized = normalizeDocument(document, options);
    if (options.bounds) {
        normalized.metadata = {
            ...(normalized.metadata ?? {}),
            bounds: options.bounds,
        };
    }

    const creator = escapeXml(options.creator ?? 'gpx-export');
    const useGarminExtension = shouldUseGarminExtension(normalized, options.extensionsXml);

    const lines: string[] = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<gpx version="1.1" creator="${creator}"`,
        `  xmlns="http://www.topografix.com/GPX/1/1"`,
        `  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
    ];

    if (useGarminExtension) {
        lines.push(
            `  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v2"`,
            `  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd`,
            `                       http://www.garmin.com/xmlschemas/TrackPointExtension/v2 https://www8.garmin.com/xmlschemas/TrackPointExtensionv2.xsd"`,
        );
    } else {
        lines.push(`  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd"`);
    }
    lines.push('>');

    lines.push(...indentLines(renderMetadata(normalized.metadata), 1));
    for (const waypoint of normalized.waypoints ?? []) {
        lines.push(...renderWaypoint(waypoint, 1));
    }
    for (const route of normalized.routes ?? []) {
        lines.push(...renderRoute(route, 1));
    }
    for (const track of normalized.tracks ?? []) {
        lines.push(...renderTrack(track, 1));
    }

    if (hasValue(options.extensionsXml)) {
        lines.push('  <extensions>');
        lines.push(options.extensionsXml);
        lines.push('  </extensions>');
    }

    lines.push(`</gpx>`);
    return lines.join('\n');
}

function isTrackInput(input: GpxTrack | GpxDocument): input is GpxTrack {
    return 'name' in input;
}

export function generateGpx(input: GpxTrack | GpxDocument, options: GpxOptions = {}): string {
    if (isTrackInput(input)) {
        return generateGpxDocument({ tracks: [input] }, options);
    }

    return generateGpxDocument(input, options);
}

