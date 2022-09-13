import { resources } from '../resources/resources-loader';
import { audioContext, createAudioBuffer } from './sfxr';

const buffers: AudioBuffer[] = [];

export function playAudio(id: number) {
	if (!buffers[id]) {
		buffers[id] = createAudioBuffer(new Float32Array(resources[id]!));
	}
	var source = audioContext.createBufferSource();
	source.buffer = buffers[id];

	var gainNode = audioContext.createGain()
	gainNode.gain.value = 0.1

	source.connect(gainNode)

	gainNode.connect(audioContext.destination)

	source.start();
}
