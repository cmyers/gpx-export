import { describe, it, expect } from 'vitest';
import { generateGpx } from '../src/GpxExport';

describe('generateGpx', () => {
    it('generates a basic GPX document', () => {
        const now = new Date('2024-01-01T12:00:00Z');

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
        expect(gpx).toContain('<time>2024-01-01T12:00:00.000Z</time>');
    });

    it('includes Garmin speed extension when speed is present', () => {
        const now = new Date('2024-01-01T12:00:00Z');

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
});
