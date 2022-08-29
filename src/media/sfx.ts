import { resources } from '../resources/resources-loader';
import { audioContext, createAudioBuffer } from './sfxr';

const buffers: AudioBuffer[] = [];

export function playAudio(id: number) {
	if (!buffers[id]) {
		buffers[id] = createAudioBuffer(new Float32Array(resources[id]!));
	}
	var source = audioContext.createBufferSource();
	source.buffer = buffers[id];
	source.connect(audioContext.destination);
	source.start();
}
