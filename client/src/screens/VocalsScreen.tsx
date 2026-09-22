import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { socketClient } from '../network/SocketClient';
import { PitchDetector, PitchResult } from '../ai/PitchDetector';
import { PitchVisualizer } from '../components/PitchVisualizer';
import { KeySynth } from '../audio/KeySynth';
import { Room } from '../types';

interface Props {
  room: Room;
  selfName: string;
  onBackToLobby: () => void;
}

const SCALE_PRESETS = ['C Major', 'A Minor', 'Pentatonic', 'Chromatic'];
const QUICK_NOTES = ['C4', 'E4', 'G4', 'A4', 'C5'];

export const VocalsScreen: React.FC<Props> = ({ room, selfName, onBackToLobby }) => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [scaleName, setScaleName] = useState('C Major');
  const [pitchData, setPitchData] = useState<PitchResult>({
    frequency: 0,
    note: '-',
    cents: 0,
    confidence: 0,
    isNoteActive: false,
  });

  const pitchDetector = useState(() => new PitchDetector())[0];

  useEffect(() => {
    let interval: any;
    if (isMicActive) {
      interval = setInterval(() => {
        const res = pitchDetector.detectPitch(scaleName);
        if (res) {
          setPitchData(res);
          if (res.isNoteActive && res.confidence > 75) {
            triggerVocalNote(res.note, 0.7);
          }
        }
      }, 150);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMicActive, scaleName]);

  const toggleMic = async () => {
    if (!isMicActive) {
      const ok = await pitchDetector.startMicrophone();
      if (ok) setIsMicActive(true);
    } else {
      pitchDetector.stopMicrophone();
      setIsMicActive(false);
      setPitchData({ frequency: 0, note: '-', cents: 0, confidence: 0, isNoteActive: false });
    }
  };

  const triggerVocalNote = (note: string, velocity = 0.8) => {
    // Play local vocal synth pad sound
    KeySynth.playNote(note, undefined, 0.4, velocity, 'pad');

    // Broadcast note to band room
    socketClient.sendNoteEvent({
      roomId: room.code,
      senderName: selfName,
      instrument: 'vocals',
      note,
      velocity,
      duration: 400,
      timestamp: Date.now(),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToLobby}>
          <Text style={styles.backBtnText}>← BAND LOBBY</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>🎤 AI VOCALS STAGE</Text>
      </View>

      {/* Mic Power Toggle */}
      <TouchableOpacity
        style={[styles.micPowerBtn, isMicActive ? styles.micPowerBtnActive : null]}
        onPress={toggleMic}
      >
        <Text style={[styles.micPowerText, isMicActive ? styles.micPowerTextActive : null]}>
          {isMicActive ? '🎤 MICROPHONE LIVE (TAP TO STOP)' : '🎙 START MIC PITCH RECOGNIZER'}
        </Text>
      </TouchableOpacity>

      {/* Scale Lock Selector */}
      <View style={styles.scaleBar}>
        <Text style={styles.scaleLabel}>AUTOTUNE SCALE LOCK:</Text>
        {SCALE_PRESETS.map(sc => (
          <TouchableOpacity
            key={sc}
            style={[styles.scaleBtn, scaleName === sc ? styles.scaleBtnActive : null]}
            onPress={() => setScaleName(sc)}
          >
            <Text style={[styles.scaleText, scaleName === sc ? styles.scaleTextActive : null]}>
              {sc.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <PitchVisualizer
        note={pitchData.note}
        frequency={pitchData.frequency}
        cents={pitchData.cents}
        confidence={pitchData.confidence}
        isNoteActive={pitchData.isNoteActive}
        scaleName={scaleName}
      />

      {/* Manual Touch Vocal Pads */}
      <Text style={styles.manualLabel}>MANUAL VOCAL MELODY PADS:</Text>
      <View style={styles.quickNoteRow}>
        {QUICK_NOTES.map(note => (
          <TouchableOpacity
            key={note}
            style={styles.quickPad}
            onPress={() => triggerVocalNote(note, 0.85)}
          >
            <Text style={styles.quickPadIcon}>🎤</Text>
            <Text style={styles.quickPadText}>{note}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#11111B',
    minHeight: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: '#313244',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#CDD6F4',
    fontSize: 12,
    fontWeight: '700',
  },
  screenTitle: {
    color: '#F9E2AF',
    fontSize: 16,
    fontWeight: '900',
  },
  micPowerBtn: {
    backgroundColor: '#1E1E2E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#F9E2AF',
  },
  micPowerBtnActive: {
    backgroundColor: '#FF3348',
    borderColor: '#FFF',
  },
  micPowerText: {
    color: '#F9E2AF',
    fontSize: 13,
    fontWeight: '900',
  },
  micPowerTextActive: {
    color: '#FFF',
  },
  scaleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#313244',
  },
  scaleLabel: {
    color: '#A6ADC8',
    fontSize: 9,
    fontWeight: '800',
    marginRight: 6,
  },
  scaleBtn: {
    backgroundColor: '#181825',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  scaleBtnActive: {
    backgroundColor: '#F9E2AF',
  },
  scaleText: {
    color: '#CDD6F4',
    fontSize: 10,
    fontWeight: '700',
  },
  scaleTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  manualLabel: {
    color: '#A6ADC8',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
  },
  quickNoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickPad: {
    flex: 1,
    height: 70,
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#F9E2AF',
  },
  quickPadIcon: {
    fontSize: 18,
  },
  quickPadText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
    marginTop: 2,
  },
});
