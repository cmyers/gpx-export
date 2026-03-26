export interface GpxPointExtensions {
    /** Speed in m/s — written as gpxtpx:speed */
    speed?: number;
    /** Heart rate in bpm — written as gpxtpx:hr */
    heartRate?: number;
    /** Cadence in rpm — written as gpxtpx:cad */
    cadence?: number;
    /** Trusted raw XML inserted into <extensions> without escaping */
    rawXml?: string;
}
