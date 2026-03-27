import { describe, it, expect } from 'vitest';
import { generateGpx } from '../src/GpxExport';

describe('generateGpx', () => {
    it('generates a basic GPX document from track input', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            name: 'Test Track',
            points: [
                {
                    lat: 54.0,
                    lon: -1.0,
                    time: now,
                },
            ],
        });

        expect(gpx).toContain('<gpx');
        expect(gpx).toContain('<trk>');
        expect(gpx).toContain('<name>Test Track</name>');
        expect(gpx).toContain('<trkpt lat="54" lon="-1">');
        expect(gpx).toContain('<time>2026-01-01T12:00:00.000Z</time>');
    });

    it('includes Garmin speed extension when speed is present', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            name: 'Speed Test',
            points: [
                {
                    lat: 1,
                    lon: 2,
                    time: now,
                    speed: 3.5,
                },
            ],
        });

        expect(gpx).toContain('gpxtpx:TrackPointExtension');
        expect(gpx).toContain('<gpxtpx:speed>3.5000</gpxtpx:speed>');
    });

    it('escapes xml in legacy track name', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            name: 'Track <A&B>',
            points: [
                {
                    lat: 10,
                    lon: 20,
                    time: now,
                },
            ],
        });

        expect(gpx).toContain('<name>Track &lt;A&amp;B&gt;</name>');
    });

    it('wraps track input as a tracks-only document', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            name: 'Legacy Track',
            points: [
                {
                    lat: 12.34,
                    lon: 56.78,
                    time: now,
                },
            ],
        });

        expect(gpx).toContain('<trk>');
        expect(gpx).toContain('<name>Legacy Track</name>');
        expect(gpx).toContain('<trkpt lat="12.34" lon="56.78">');
        expect(gpx).not.toContain('<metadata>');
    });

    it('allows optional metadata for track input', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx(
            {
                name: 'Legacy Track',
                points: [
                    {
                        lat: 1,
                        lon: 2,
                        time: now,
                    },
                ],
            },
            {
                name: 'Metadata Name',
                desc: 'Metadata Description',
                time: now,
            },
        );

        expect(gpx).toContain('<metadata>');
        expect(gpx).toContain('<name>Metadata Name</name>');
        expect(gpx).toContain('<desc>Metadata Description</desc>');
        expect(gpx).toContain('<time>2026-01-01T12:00:00.000Z</time>');
        expect(gpx).toContain('<name>Legacy Track</name>');
    });
});

describe('generateGpx (document input)', () => {
    it('accepts full document input with a single API', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            metadata: {
                name: 'Document Input',
                time: now,
            },
            waypoints: [
                {
                    lat: 1,
                    lon: 2,
                    name: 'W',
                },
            ],
            routes: [
                {
                    name: 'R',
                    points: [
                        {
                            lat: 1,
                            lon: 2,
                        },
                    ],
                },
            ],
            tracks: [
                {
                    name: 'T',
                    points: [
                        {
                            lat: 1,
                            lon: 2,
                            time: now,
                        },
                    ],
                },
            ],
        });

        expect(gpx).toContain('<metadata>');
        expect(gpx).toContain('<name>Document Input</name>');
        expect(gpx).toContain('<wpt lat="1" lon="2">');
        expect(gpx).toContain('<rte>');
        expect(gpx).toContain('<trk>');
    });

    it('renders a minimal Strava-compatible track activity shape', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            tracks: [
                {
                    name: 'Morning Run',
                    points: [
                        {
                            lat: 51.5007,
                            lon: -0.1246,
                            time: now,
                            elevation: 12.3,
                        },
                        {
                            lat: 51.5008,
                            lon: -0.1242,
                            time: new Date('2026-01-01T12:00:10.000Z'),
                            elevation: 12.8,
                        },
                    ],
                },
            ],
        });

        expect(gpx).toContain('<gpx version="1.1" creator="gpx-export"');
        expect(gpx).toContain('xmlns="http://www.topografix.com/GPX/1/1"');
        expect(gpx).toContain('<trk>');
        expect(gpx).toContain('<name>Morning Run</name>');
        expect(gpx).toContain('<trkseg>');
        expect(gpx).toContain('<trkpt lat="51.5007" lon="-0.1246">');
        expect(gpx).toContain('<time>2026-01-01T12:00:00.000Z</time>');
        expect(gpx).toContain('<time>2026-01-01T12:00:10.000Z</time>');

        // Keep the minimal track shape free of unrelated sections.
        expect(gpx).not.toContain('<wpt ');
        expect(gpx).not.toContain('<rte>');
        expect(gpx).not.toContain('xmlns:gpxtpx=');
    });

    it('generates waypoints, routes, and tracks with deterministic order', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            metadata: {
                name: 'Document Name',
                desc: 'Document Description',
                keywords: 'test,document',
                time: now,
            },
            waypoints: [
                {
                    lat: 40,
                    lon: -74,
                    name: 'Start',
                    time: now,
                },
            ],
            routes: [
                {
                    name: 'Route One',
                    points: [
                        {
                            lat: 40,
                            lon: -74,
                            time: now,
                        },
                        {
                            lat: 41,
                            lon: -73,
                            time: now,
                        },
                    ],
                },
            ],
            tracks: [
                {
                    name: 'Track One',
                    segments: [
                        {
                            points: [
                                {
                                    lat: 40,
                                    lon: -74,
                                    time: now,
                                },
                            ],
                        },
                        {
                            points: [
                                {
                                    lat: 41,
                                    lon: -73,
                                    time: now,
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        const metadataIndex = gpx.indexOf('<metadata>');
        const waypointIndex = gpx.indexOf('<wpt ');
        const routeIndex = gpx.indexOf('<rte>');
        const trackIndex = gpx.indexOf('<trk>');

        expect(metadataIndex).toBeGreaterThan(-1);
        expect(waypointIndex).toBeGreaterThan(metadataIndex);
        expect(routeIndex).toBeGreaterThan(waypointIndex);
        expect(trackIndex).toBeGreaterThan(routeIndex);
        expect(gpx.match(/<trkseg>/g)?.length ?? 0).toBe(2);
    });

    it('uses metadata bounds from the document', () => {
        const gpx = generateGpx(
            {
                metadata: {
                    bounds: {
                        minLat: 1,
                        minLon: 2,
                        maxLat: 3,
                        maxLon: 4,
                    },
                },
                tracks: [
                    {
                        name: 'Track',
                        points: [],
                    },
                ],
            },
        );

        expect(gpx).toContain('<bounds minlat="1" minlon="2" maxlat="3" maxlon="4" />');
    });

    it('uses default creator', () => {
        const gpx = generateGpx({
            tracks: [
                {
                    name: 'Track',
                    points: [],
                },
            ],
        });

        expect(gpx).toContain('<gpx version="1.1" creator="gpx-export"');
    });

    it('supports heart rate and cadence extensions', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            tracks: [
                {
                    name: 'Fitness',
                    points: [
                        {
                            lat: 1,
                            lon: 2,
                            time: now,
                            extensions: {
                                heartRate: 150,
                                cadence: 85,
                            },
                        },
                    ],
                },
            ],
        });

        expect(gpx).toContain('xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v2"');
        expect(gpx).toContain('<gpxtpx:hr>150</gpxtpx:hr>');
        expect(gpx).toContain('<gpxtpx:cad>85</gpxtpx:cad>');
    });

    it('does not emit Garmin TrackPointExtension for non-track points', () => {
        const gpx = generateGpx({
            waypoints: [
                {
                    lat: 1,
                    lon: 2,
                    extensions: {
                        heartRate: 150,
                        cadence: 85,
                        speed: 3.5,
                    },
                },
            ],
            routes: [
                {
                    name: 'R',
                    points: [
                        {
                            lat: 1,
                            lon: 2,
                            extensions: {
                                heartRate: 140,
                            },
                        },
                    ],
                },
            ],
        });

        expect(gpx).not.toContain('xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v2"');
        expect(gpx).not.toContain('gpxtpx:TrackPointExtension');
        expect(gpx).not.toContain('<gpxtpx:hr>');
        expect(gpx).not.toContain('<gpxtpx:cad>');
        expect(gpx).not.toContain('<gpxtpx:speed>');
    });

    it('is deterministic for identical input', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');
        const input = {
            metadata: {
                name: 'Deterministic',
                time: now,
            },
            tracks: [
                {
                    name: 'Track',
                    points: [
                        {
                            lat: 1,
                            lon: 2,
                            time: now,
                        },
                    ],
                },
            ],
        };

        const a = generateGpx(input);
        const b = generateGpx(input);
        expect(a).toBe(b);
    });

    it('renders metadata in GPX 1.1 field order with structured copyright', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            metadata: {
                name: 'N',
                desc: 'D',
                author: {
                    name: 'Chris',
                },
                copyright: {
                    author: 'Chris',
                    year: 2024,
                    license: 'https://github.com/cmyers/gpx-export/blob/main/LICENSE',
                },
                link: {
                    href: 'https://github.com/cmyers/gpx-export',
                },
                time: now,
                keywords: 'k',
            },
        });

        const authorIdx = gpx.indexOf('<author>');
        const copyrightIdx = gpx.indexOf('<copyright author="Chris">');
        const linkIdx = gpx.indexOf('<link href="https://github.com/cmyers/gpx-export">');
        const timeIdx = gpx.indexOf('<time>2026-01-01T12:00:00.000Z</time>');
        const keywordsIdx = gpx.indexOf('<keywords>k</keywords>');

        expect(copyrightIdx).toBeGreaterThan(authorIdx);
        expect(linkIdx).toBeGreaterThan(copyrightIdx);
        expect(timeIdx).toBeGreaterThan(linkIdx);
        expect(keywordsIdx).toBeGreaterThan(timeIdx);
        expect(gpx).toContain('<year>2024</year>');
        expect(gpx).toContain('<license>https://github.com/cmyers/gpx-export/blob/main/LICENSE</license>');
    });

    it('renders waypoint ele and time before name/cmt/desc', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            waypoints: [
                {
                    lat: 1,
                    lon: 2,
                    elevation: 99.1,
                    time: now,
                    name: 'Name',
                    cmt: 'Comment',
                    desc: 'Description',
                },
            ],
        });

        const eleIdx = gpx.indexOf('<ele>99.10</ele>');
        const timeIdx = gpx.indexOf('<time>2026-01-01T12:00:00.000Z</time>');
        const nameIdx = gpx.indexOf('<name>Name</name>');
        const cmtIdx = gpx.indexOf('<cmt>Comment</cmt>');
        const descIdx = gpx.indexOf('<desc>Description</desc>');

        expect(eleIdx).toBeGreaterThan(-1);
        expect(timeIdx).toBeGreaterThan(eleIdx);
        expect(nameIdx).toBeGreaterThan(timeIdx);
        expect(cmtIdx).toBeGreaterThan(nameIdx);
        expect(descIdx).toBeGreaterThan(cmtIdx);
    });

    it('renders backward-compatible string copyright as author attribute', () => {
        const gpx = generateGpx({
            metadata: {
                copyright: 'Legacy Owner',
            },
        });

        expect(gpx).toContain('<copyright author="Legacy Owner" />');
    });

    it('renders a maximal supported document', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');

        const gpx = generateGpx({
            metadata: {
                name: 'Doc Name',
                desc: 'Doc Desc',
                author: {
                    name: 'Chris',
                    link: {
                        href: 'https://github.com/cmyers/gpx-export',
                        text: 'Project',
                        type: 'text/html',
                    },
                },
                copyright: {
                    author: 'Chris',
                    year: 2024,
                    license: 'https://github.com/cmyers/gpx-export/blob/main/LICENSE',
                },
                link: {
                    href: 'https://github.com/cmyers/gpx-export',
                    text: 'Project',
                    type: 'text/html',
                },
                time: now,
                keywords: 'a,b,c',
                bounds: {
                    minLat: 1,
                    minLon: 2,
                    maxLat: 3,
                    maxLon: 4,
                },
            },
            waypoints: [
                {
                    lat: 50.1,
                    lon: -1.2,
                    elevation: 12.34,
                    time: now,
                    name: 'Waypoint A',
                    cmt: 'Waypoint Comment',
                    desc: 'Waypoint Description',
                    extensions: {
                        speed: 1.2345,
                        heartRate: 140,
                        cadence: 88,
                        rawXml: '<x:wpt xmlns:x="urn:test">w</x:wpt>',
                    },
                },
            ],
            routes: [
                {
                    name: 'Route A',
                    cmt: 'Route Comment',
                    desc: 'Route Description',
                    extensions: {
                        rawXml: '<x:rte xmlns:x="urn:test">r</x:rte>',
                    },
                    points: [
                        {
                            lat: 50.2,
                            lon: -1.3,
                            elevation: 13.45,
                            time: now,
                            extensions: {
                                speed: 2.3456,
                                heartRate: 150,
                                cadence: 90,
                                rawXml: '<x:rtept xmlns:x="urn:test">rp</x:rtept>',
                            },
                        },
                    ],
                },
            ],
            tracks: [
                {
                    name: 'Track A',
                    cmt: 'Track Comment',
                    desc: 'Track Description',
                    extensions: {
                        rawXml: '<x:trk xmlns:x="urn:test">t</x:trk>',
                    },
                    segments: [
                        {
                            points: [
                                {
                                    lat: 50.3,
                                    lon: -1.4,
                                    elevation: 14.56,
                                    time: now,
                                    speed: 3.4567,
                                    extensions: {
                                        heartRate: 160,
                                        cadence: 95,
                                        rawXml: '<x:trkpt xmlns:x="urn:test">tp</x:trkpt>',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        expect(gpx).toContain('<gpx version="1.1" creator="gpx-export"');
        expect(gpx).toContain('xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v2"');

        expect(gpx).toContain('<metadata>');
        expect(gpx).toContain('<name>Doc Name</name>');
        expect(gpx).toContain('<desc>Doc Desc</desc>');
        expect(gpx).toContain('<author>');
        expect(gpx).toContain('<link href="https://github.com/cmyers/gpx-export">');
        expect(gpx).toContain('<text>Project</text>');
        expect(gpx).toContain('<type>text/html</type>');
        expect(gpx).toContain('<copyright author="Chris">');
        expect(gpx).toContain('<year>2024</year>');
        expect(gpx).toContain('<license>https://github.com/cmyers/gpx-export/blob/main/LICENSE</license>');
        expect(gpx).toContain('<link href="https://github.com/cmyers/gpx-export">');
        expect(gpx).toContain('<time>2026-01-01T12:00:00.000Z</time>');
        expect(gpx).toContain('<keywords>a,b,c</keywords>');
        expect(gpx).toContain('<bounds minlat="1" minlon="2" maxlat="3" maxlon="4" />');

        expect(gpx).toContain('<wpt lat="50.1" lon="-1.2">');
        expect(gpx).toContain('<name>Waypoint A</name>');
        expect(gpx).toContain('<x:wpt xmlns:x="urn:test">w</x:wpt>');
        expect(gpx).toContain('<rte>');
        expect(gpx).toContain('<name>Route A</name>');
        expect(gpx).toContain('<x:rte xmlns:x="urn:test">r</x:rte>');
        expect(gpx).toContain('<x:rtept xmlns:x="urn:test">rp</x:rtept>');

        expect(gpx).toContain('<trk>');
        expect(gpx).toContain('<name>Track A</name>');
        expect(gpx).toContain('<x:trk xmlns:x="urn:test">t</x:trk>');
        expect(gpx).toContain('<trkpt lat="50.3" lon="-1.4">');
        expect(gpx).toContain('<x:trkpt xmlns:x="urn:test">tp</x:trkpt>');

        expect(gpx).toContain('<gpxtpx:speed>3.4567</gpxtpx:speed>');
        expect(gpx).toContain('<gpxtpx:hr>160</gpxtpx:hr>');
        expect(gpx).toContain('<gpxtpx:cad>95</gpxtpx:cad>');
    });
});
