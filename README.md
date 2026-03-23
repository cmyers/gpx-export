# **gpx-export**

Zero‑dependency GPX 1.1 generator with optional Garmin TrackPointExtension v2 support.  
Works in Node.js, browsers, Capacitor, and any JS runtime.

---

## Install

```sh
npm install gpx-export
```

---

## Usage

```ts
import { generateGpx } from 'gpx-export';

const gpx = generateGpx({
  name: 'Morning Ride',
  points: [
    {
      lat: 54.5741,
      lon: -1.3180,
      time: new Date(),
      elevation: 32.4,
      speed: 5.2, // m/s
    },
  ],
});

console.log(gpx);
```

---

## API

### `generateGpx(track: GpxTrack, options?: GpxOptions): string`

Returns a GPX 1.1 XML document as a string.

---

## Types

```ts
interface GpxPoint {
  lat: number;
  lon: number;
  time: Date;
  speed?: number;     // m/s — gpxtpx:speed
  elevation?: number; // metres — <ele>
}

interface GpxTrack {
  name: string;
  createdAt?: Date;   // defaults to first point time
  points: GpxPoint[];
}

interface GpxOptions {
  creator?: string;   // defaults to "gpx-export"
}
```

---

## Notes

- Adds Garmin `gpxtpx` namespace only when speed values are present.  
- If `createdAt` is omitted, metadata time uses the first point time; if there are no points, it falls back to the current time.  
- Elevation is formatted to 2 decimal places; speed is formatted to 4 decimal places.  
- Saving/downloading the GPX is left to the caller.

---

## License

MIT