import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  note: string;
  frequency: number;
  cents: number;
  confidence: number;
  isNoteActive: boolean;
  scaleName: string;
}

export const PitchVisualizer: React.FC<Props> = ({
  note,
  frequency,
  cents,
  confidence,
  isNoteActive,
  scaleName,
}) => {
  // Map cents (-50 to +50) to percentage (0% to 100%)
  const tunerPercentage = Math.max(0, Math.min(100, ((cents + 50) / 100) * 100));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI VOCAL PITCH RECOGNIZER ({scaleName.toUpperCase()})</Text>

      <View style={styles.noteBox}>
        <Text style={[styles.noteDisplay, isNoteActive ? styles.activeNote : styles.inactiveNote]}>
          {isNoteActive ? note : '🎤 SING / HUM'}
        </Text>
        <Text style={styles.freqDisplay}>
          {isNoteActive ? `${frequency} Hz` : 'Listening on Microphone...'}
        </Text>
      </View>

      {/* Cents Tuner Meter */}
      <View style={styles.tunerSection}>
        <Text style={styles.tunerLabel}>PITCH ACCURACY TUNER</Text>
        <View style={styles.tunerTrack}>
          <View style={styles.centerLine} />
          {isNoteActive && (
            <View
              style={[
                styles.tunerPointer,
                { left: `${tunerPercentage}%` },
                Math.abs(cents) < 10 ? styles.inTune : styles.outOfTune,
              ]}
            />
          )}
        </View>
        <View style={styles.centsLabelRow}>
          <Text style={styles.centsText}>-50♭</Text>
          <Text style={[styles.centsText, Math.abs(cents) < 10 ? styles.inTuneText : null]}>
            {isNoteActive ? `${cents > 0 ? '+' : ''}${cents} cents` : 'IN TUNE'}
          </Text>
          <Text style={styles.centsText}>+50♯</Text>
        </View>
      </View>

      {/* Confidence Bar */}
      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>Signal Confidence:</Text>
        <View style={styles.confTrack}>
          <View
            style={[
              styles.confBar,
              { width: `${confidence}%`, backgroundColor: confidence > 70 ? '#00E676' : '#FFC300' },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181825',
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#313244',
  },
  title: {
    color: '#F9E2AF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  noteBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  noteDisplay: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2,
  },
  activeNote: {
    color: '#00E676',
  },
  inactiveNote: {
    color: '#585B70',
    fontSize: 24,
  },
  freqDisplay: {
    color: '#A6ADC8',
    fontSize: 12,
    marginTop: 4,
  },
  tunerSection: {
    marginVertical: 10,
  },
  tunerLabel: {
    color: '#A6ADC8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  tunerTrack: {
    height: 12,
    backgroundColor: '#313244',
    borderRadius: 6,
    position: 'relative',
    justifyContent: 'center',
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    width: 2,
    height: '100%',
    backgroundColor: '#89B4FA',
  },
  tunerPointer: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: -1,
    marginLeft: -7,
  },
  inTune: {
    backgroundColor: '#00E676',
    shadowColor: '#00E676',
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },
  outOfTune: {
    backgroundColor: '#FF33A8',
  },
  centsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  centsText: {
    color: '#A6ADC8',
    fontSize: 10,
  },
  inTuneText: {
    color: '#00E676',
    fontWeight: '800',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  confidenceLabel: {
    color: '#A6ADC8',
    fontSize: 10,
    marginRight: 8,
  },
  confTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#313244',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confBar: {
    height: '100%',
    borderRadius: 3,
  },
});
