// FrictionTrace — Audio Utilities
// Ambient sound monitoring + voice recording via Web Audio API

export class AmbientMonitor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private _level: number = 0;
  private onLevel?: (level: number) => void;

  get level(): number {
    return this._level;
  }

  async start(onLevel?: (level: number) => void): Promise<boolean> {
    this.onLevel = onLevel;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);

      this.measure();
      return true;
    } catch (e) {
      console.warn('Ambient monitor failed to start:', e);
      return false;
    }
  }

  private measure = (): void => {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    // Normalize to 0-100
    this._level = Math.round((sum / bufferLength / 255) * 100);
    this.onLevel?.(this._level);

    this.animationFrame = requestAnimationFrame(this.measure);
  };

  stop(): number {
    const finalLevel = this._level;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this._level = 0;

    return finalLevel;
  }
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;

  async start(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType(),
      });
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      this.mediaRecorder.start();
      this.startTime = Date.now();
      return true;
    } catch (e) {
      console.warn('Voice recorder failed to start:', e);
      return false;
    }
  }

  stop(): Promise<{ base64: string; duration: number } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      const duration = Math.round((Date.now() - this.startTime) / 1000);

      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.chunks, { type: this.getSupportedMimeType() });
        const base64 = await this.blobToBase64(blob);

        if (this.stream) {
          this.stream.getTracks().forEach((t) => t.stop());
          this.stream = null;
        }

        resolve({ base64, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private getSupportedMimeType(): string {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'audio/webm';
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Get ambient level label
export function getAmbientLabel(level: number): string {
  if (level < 15) return 'Very Quiet';
  if (level < 30) return 'Quiet';
  if (level < 50) return 'Moderate';
  if (level < 70) return 'Loud';
  return 'Very Loud';
}

export function getAmbientColor(level: number): string {
  if (level < 15) return '#22c55e';
  if (level < 30) return '#84cc16';
  if (level < 50) return '#f59e0b';
  if (level < 70) return '#f97316';
  return '#ef4444';
}
