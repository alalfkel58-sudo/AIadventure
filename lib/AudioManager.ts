
type SoundEffect = 'choice' | 'item_pickup' | 'success' | 'failure';
type MusicTrack = 'ambient_fantasy' | 'ambient_scifi' | 'ambient_horror' | 'ambient_default';

const sfxFiles: Record<SoundEffect, string> = {
    choice: '/audio/choice.wav',
    item_pickup: '/audio/item_pickup.wav',
    success: '/audio/success.wav',
    failure: '/audio/failure.wav',
};

const musicFiles: Record<MusicTrack, string> = {
    ambient_fantasy: '/audio/ambient_fantasy.mp3',
    ambient_scifi: '/audio/ambient_scifi.mp3',
    ambient_horror: '/audio/ambient_horror.mp3',
    ambient_default: '/audio/ambient_default.mp3',
};

class AudioManager {
    private audioContext: AudioContext | null = null;
    private sfxBuffers: Map<SoundEffect, AudioBuffer> = new Map();
    private musicSource: AudioBufferSourceNode | null = null;
    private musicGainNode: GainNode | null = null;
    private isMuted: boolean = false;
    private isInitialized: boolean = false;
    private musicVolume: number = 0.3;

    constructor() {
        if (typeof window !== 'undefined') {
            // Defer context creation until first user interaction
        }
    }

    private async init() {
        if (this.isInitialized || typeof window === 'undefined') return;
        
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.isInitialized = true;
            await this.loadAllSounds();
        } catch (e) {
            console.error("Could not initialize AudioContext:", e);
            this.isInitialized = false;
        }
    }

    private async loadSound(url: string): Promise<AudioBuffer | null> {
        if (!this.audioContext) return null;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            return await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error(`Failed to load sound: ${url}`, error);
            return null;
        }
    }

    private async loadAllSounds() {
        const sfxPromises = Object.entries(sfxFiles).map(async ([key, path]) => {
            const buffer = await this.loadSound(path);
            if (buffer) {
                this.sfxBuffers.set(key as SoundEffect, buffer);
            }
        });
        await Promise.all(sfxPromises);
    }
    
    public async playSound(effect: SoundEffect) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        if (!this.audioContext || this.isMuted) return;

        const buffer = this.sfxBuffers.get(effect);
        if (buffer) {
            try {
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                source.start(0);
            } catch (e) {
                console.error("Error playing sound:", e)
            }
        } else {
            console.warn(`Sound effect '${effect}' not loaded.`);
        }
    }

    public async playMusic(track: MusicTrack) {
        if (!this.isInitialized) {
            await this.init();
        }
        if (!this.audioContext) return;

        if (this.musicSource) {
            this.stopMusic();
        }

        const buffer = await this.loadSound(musicFiles[track]);
        if (buffer && this.audioContext) {
            try {
                this.musicSource = this.audioContext.createBufferSource();
                this.musicSource.buffer = buffer;
                this.musicSource.loop = true;

                this.musicGainNode = this.audioContext.createGain();
                this.musicGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.audioContext.currentTime);
                
                this.musicSource.connect(this.musicGainNode);
                this.musicGainNode.connect(this.audioContext.destination);
                this.musicSource.start(0);
            } catch (e) {
                console.error("Error playing music:", e);
            }
        }
    }

    public stopMusic() {
        if (this.musicSource) {
            this.musicSource.stop();
            this.musicSource.disconnect();
            this.musicSource = null;
        }
        if (this.musicGainNode) {
            this.musicGainNode.disconnect();
            this.musicGainNode = null;
        }
    }
    
    public getMuteState(): boolean {
        return this.isMuted;
    }

    public toggleMute(): boolean {
        if (!this.isInitialized) {
            // If user mutes before interacting, just set the flag.
            // init() will respect it when it runs.
            this.isMuted = !this.isMuted;
            this.init(); // Attempt to initialize audio context on first mute toggle as it's a user interaction
            return this.isMuted;
        }

        this.isMuted = !this.isMuted;
        if (this.musicGainNode && this.audioContext) {
            this.musicGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.audioContext.currentTime);
        }
        return this.isMuted;
    }
}

// Singleton instance
export const audioManager = new AudioManager();
