declare global {
    interface HTMLVideoElement {
        captureStream(): MediaStream;
        mozCaptureStream(): MediaStream;
    }
}
export declare function patchVideo(target: HTMLVideoElement, source: HTMLVideoElement): void;
