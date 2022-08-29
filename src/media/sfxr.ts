export const audioContext = new AudioContext();

// Wave shapes

const SQUARE = 0;
const SAWTOOTH = 1;
const SINE = 2;
const NOISE = 3;

const p_wave = 0;
const p_env_attack = 1;
const p_env_sustain = 2;
const p_env_punch = 3;
const p_env_decay = 4
const p_base_freq = 5
const p_freq_limit = 6
const p_freq_ramp = 7
const p_freq_dramp = 8
const p_vib_strength = 9
const p_vib_speed = 10
const p_arp_mod = 11
const p_arp_speed = 12
const p_duty = 13
const p_duty_ramp = 14
const p_repeat_speed = 15
const p_pha_offset = 16
const p_pha_ramp = 17
const p_lpf_freq = 18
const p_lpf_ramp = 19
const p_lpf_resonance = 20
const p_hpf_freq = 21
const p_hpf_ramp = 22

// render volume
const masterVolume = 1;
const OVERSAMPLING = 8;
// default sample parameters
const base_sound_vol = 0.5;
const gain = masterVolume * (Math.exp(base_sound_vol) - 1);

// Sound generation parameters are on [0,1] unless noted SIGNED & thus
// on [-1,1]
function render(ps: Float32Array): Float32Array {
	let elapsedSinceRepeat = 0;

	const period0 = ps[p_base_freq];
	const periodMax = Math.abs(ps[p_freq_limit]);
	const enableFrequencyCutoff = ps[p_freq_limit] > 0;
	const periodMult0 = ps[p_freq_ramp];
	const periodMultSlide = ps[p_freq_dramp];
	const dutyCycle0 = ps[p_duty];
	const dutyCycleSlide0 = ps[p_duty_ramp];
	const arpeggioMultiplier = ps[p_arp_mod];
	const arpeggioTime0 = ps[p_arp_speed];

	// init repeat
	let period = period0;
	let periodMult = periodMult0;
	let dutyCycle = dutyCycle0;
	let dutyCycleSlide = dutyCycleSlide0;
	let arpeggioTime = arpeggioTime0;

	// Waveform shape
	const waveShape = ps[p_wave];

	// Filter
	let fltw = ps[p_lpf_freq];
	const enableLowPassFilter = (fltw !== 0.1);
	const fltw_d = ps[p_lpf_ramp];
	const fltdmp = ps[p_lpf_resonance];
	let flthp = ps[p_hpf_freq];
	const flthp_d = ps[p_hpf_ramp];

	// Vibrato
	const vibratoSpeed = ps[p_vib_speed];
	const vibratoAmplitude = ps[p_vib_strength];

	// Envelope
	const envelopeLength = [
		ps[p_env_attack],
		ps[p_env_sustain],
		ps[p_env_decay],
	];
	const envelopePunch = ps[p_env_punch];

	// Flanger
	let flangerOffset = ps[p_pha_offset];
	const flangerOffsetSlide = ps[p_pha_ramp];

	// Repeat
	const repeatTime = ps[p_repeat_speed];

	////////// RENDER
	let fltp = 0;
	let fltdp = 0;
	let fltphp = 0;

	let noise_buffer = new Float32Array(32);
	for (let i = 0; i < 32; ++i) {
		noise_buffer[i] = Math.random() * 2 - 1;
	}

	let envelopeStage = 0;
	let envelopeElapsed = 0;

	let vibratoPhase = 0;

	let phase = 0;
	let ipp = 0;
	let flanger_buffer = new Float32Array(1024);
	for (let i = 0; i < 1024; ++i) {
		flanger_buffer[i] = 0;
	}

	let normalized: number[] = [];

	for (let t = 0; ; ++t) {

		// Repeats
		if (repeatTime !== 0 && ++elapsedSinceRepeat >= repeatTime) {
			// INIT REPEAT
			period = period0;
			periodMult = periodMult0;
			dutyCycle = dutyCycle0;
			dutyCycleSlide = dutyCycleSlide0;
			arpeggioTime = arpeggioTime0;
		}

		// Arpeggio (single)
		if (arpeggioTime !== 0 && t >= arpeggioTime) {
			arpeggioTime = 0;
			period *= arpeggioMultiplier;
		}

		// Frequency slide, and frequency slide slide!
		periodMult += periodMultSlide;
		period *= periodMult;
		if (period > periodMax) {
			period = periodMax;
			if (enableFrequencyCutoff) {
				break;
			}
		}

		// Vibrato
		let rfperiod = period;
		if (vibratoAmplitude > 0) {
			vibratoPhase += vibratoSpeed;
			rfperiod = period * (1 + Math.sin(vibratoPhase) * vibratoAmplitude);
		}
		let iperiod = Math.floor(rfperiod);
		if (iperiod < OVERSAMPLING) {
			iperiod = OVERSAMPLING;
		}

		// Square wave duty cycle
		dutyCycle += dutyCycleSlide;
		if (dutyCycle < 0) {
			dutyCycle = 0;
		}
		if (dutyCycle > 0.5) {
			dutyCycle = 0.5;
		}

		// Volume envelope
		if (++envelopeElapsed > envelopeLength[envelopeStage]) {
			envelopeElapsed = 0;
			if (++envelopeStage > 2) {
				break;
			}
		}
		const envf = envelopeElapsed / envelopeLength[envelopeStage];
		let env_vol;
		if (envelopeStage === 0) {         // Attack
			env_vol = envf;
		} else if (envelopeStage === 1) {  // Sustain
			env_vol = 1 + (1 - envf) * 2 * envelopePunch;
		} else {                           // Decay
			env_vol = 1 - envf;
		}

		// Flanger step
		flangerOffset += flangerOffsetSlide;
		let iphase = Math.abs(Math.floor(flangerOffset));
		if (iphase > 1023) {
			iphase = 1023;
		}

		if (flthp_d !== 0) {
			flthp *= flthp_d;
			if (flthp < 0.00001) {
				flthp = 0.00001;
			}
			if (flthp > 0.1) {
				flthp = 0.1;
			}
		}

		// 8x oversampling
		let sample = 0;
		for (let si = 0; si < OVERSAMPLING; ++si) {
			let sub_sample = 0;
			++phase;
			if (phase >= iperiod) {
				phase %= iperiod;
				if (waveShape === NOISE) {
					for (let i = 0; i < 32; ++i) {
						noise_buffer[i] = Math.random() * 2 - 1;
					}
				}
			}

			// Base waveform
			const fp = phase / iperiod;
			if (waveShape === SQUARE) {
				sub_sample = fp < dutyCycle ? 0.5 : -0.5;
			} else if (waveShape === SAWTOOTH) {
				if (fp < dutyCycle) {
					sub_sample = -1 + 2 * fp / dutyCycle;
				} else {
					sub_sample = 1 - 2 * (fp - dutyCycle) / (1 - dutyCycle);
				}
			} else if (waveShape === SINE) {
				sub_sample = Math.sin(fp * 2 * Math.PI);
			} else if (waveShape === NOISE) {
				sub_sample = noise_buffer[(phase * 32 / iperiod) | 0];
			} else {
				// no-op; invalid wave shape
			}

			// Low-pass filter
			const pp = fltp;
			fltw *= fltw_d;
			if (fltw < 0) {
				fltw = 0;
			}
			if (fltw > 0.1) {
				fltw = 0.1;
			}
			if (enableLowPassFilter) {
				fltdp += (sub_sample - fltp) * fltw;
				fltdp -= fltdp * fltdmp;
			} else {
				fltp = sub_sample;
				fltdp = 0;
			}
			fltp += fltdp;

			// High-pass filter
			fltphp += fltp - pp;
			fltphp -= fltphp * flthp;
			sub_sample = fltphp;

			// Flanger
			flanger_buffer[ipp & 1023] = sub_sample;
			sub_sample += flanger_buffer[(ipp - iphase + 1024) & 1023];
			ipp = (ipp + 1) & 1023;

			// final accumulation and envelope application
			sample += sub_sample * env_vol;
		}

		// store normalized floating point sample
		normalized.push(sample * gain / OVERSAMPLING);
	}

	return new Float32Array(normalized);
}

export function createAudioBuffer(params: Float32Array): AudioBuffer {
	const samples = render(params);
	const audioBuffer = audioContext.createBuffer(1, samples.length, 44100);
	audioBuffer.copyToChannel(samples, 0, 0);
	return audioBuffer;
}

