// GpxExport — zero-dependency GPX 1.1 generator with Garmin TrackPointExtension v2 support

export interface GpxPoint {
    lat: number;
    lon: number;
    time: Date;
    /** Speed in m/s — written as gpxtpx:speed (Garmin TrackPointExtension v2) */
    speed?: number;
    /** Elevation in metres — written as standard GPX <ele> */
    elevation?: number;
}

export interface GpxTrack {
    name: string;
    /** Defaults to the time of the first point when omitted */
    createdAt?: Date;
    points: GpxPoint[];
}

export interface GpxOptions {
    /** Value written to the GPX creator attribute. Defaults to 'gpx-export' */
    creator?: string;
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function generateGpx(track: GpxTrack, options: GpxOptions = {}): string {
    const creator = escapeXml(options.creator ?? 'gpx-export');
    const name = escapeXml(track.name);
    const createdAt = (track.createdAt ?? track.points[0]?.time ?? new Date()).toISOString();

    const useGarminExtension = track.points.some((p) => p.speed !== undefined);

    const trkpts = track.points
        .map((p) => {
            const lines = [
                `      <trkpt lat="${p.lat}" lon="${p.lon}">`,
                ...(p.elevation !== undefined ? [`        <ele>${p.elevation.toFixed(2)}</ele>`] : []),
                `        <time>${p.time.toISOString()}</time>`,
            ];
            if (p.speed !== undefined) {
                lines.push(
                    `        <extensions>`,
                    `          <gpxtpx:TrackPointExtension>`,
                    `            <gpxtpx:speed>${p.speed.toFixed(4)}</gpxtpx:speed>`,
                    `          </gpxtpx:TrackPointExtension>`,
                    `        </extensions>`,
                );
            }
            lines.push(`      </trkpt>`);
            return lines.join('\n');
        })
        .join('\n');

    const garminAttrs = useGarminExtension
        ? [
            `  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v2"`,
            `  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd`,
            `                       http://www.garmin.com/xmlschemas/TrackPointExtension/v2 https://www8.garmin.com/xmlschemas/TrackPointExtensionv2.xsd"`,
        ]
        : [
            `  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd"`,
        ];

    return [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<gpx version="1.1" creator="${creator}"`,
        `  xmlns="http://www.topografix.com/GPX/1/1"`,
        `  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
        ...garminAttrs,
        `>`,
        `  <metadata>`,
        `    <name>${name}</name>`,
        `    <time>${createdAt}</time>`,
        `  </metadata>`,
        `  <trk>`,
        `    <name>${name}</name>`,
        `    <trkseg>`,
        trkpts,
        `    </trkseg>`,
        `  </trk>`,
        `</gpx>`,
    ].join('\n');
}
