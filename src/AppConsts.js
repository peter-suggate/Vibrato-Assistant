// Toggle features / debug capabilities
export const SHOW_LIVE_TIME_DATA = false;
export const PERFORM_FREQUENCY_ANALYSIS = false;
export const CALC_AUTO_CORRELATION = false;
export const CALC_MPM = true; // The McLeod pitch method.

// Tunable parameters
export const FREQUENCY_ANALYSIS_FFT_SIZE = 1024;
export const SCRIPT_PROCESSOR_SAMPLES_SIZE = 1024;
export const PITCH_DETECTION_WINDOW_LENGTH = SCRIPT_PROCESSOR_SAMPLES_SIZE;
export const PITCH_DETECTION_NUM_OVERLAPPED_REGIONS_PER_UPDATE = 1;

export const IN_TUNE_CENTS_TOLERANCE = 15;
