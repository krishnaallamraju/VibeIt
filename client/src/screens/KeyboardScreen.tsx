import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { socketClient } from '../network/SocketClient';
import { KeySynth, SynthPreset } from '../audio/KeySynth';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Room } from '../types';

interface Props {
  room: Room;
  selfName: string;
  onBackToLobby: () => void;
}

const KEYS = [
  { note: 'C3', isBlack: false }, { note: 'C#3', isBlack: true },
  { note: 'D3', isBlack: false }, { note: 'D#3', isBlack: true },
  { note: 'E3', isBlack: false },
  { note: 'F3', isBlack: false }, { note: 'F#3', isBlack: true },
  { note: 'G3', isBlack: false }, { note: 'G#3', isBlack: true },
  { note: 'A3', isBlack: false }, { note: 'A#3', isBlack: true },
  { note: 'B3', isBlack: false },
  { note: 'C4', isBlack: false }, { note: 'C#4', isBlack: true },
  { note: 'D4', isBlack: false }, { note: 'D#4', isBlack: true },
  { note: 'E4', isBlack: false },
  { note: 'F4', isBlack: false }, { note: 'F#4', isBlack: true },
  { note: 'G4', isBlack: false }, { note: 'G#4', isBlack: true },
  { note: 'A4', isBlack: false }, { note: 'A#4', isBlack: true },
  { note: 'B4', isBlack: false }
];

const CHORDS = [
  { label: 'C Major', notes: ['C4', 'E4', 'G4'] },
  { label: 'F Major', notes: ['F3', 'A3', 'C4'] },
  { label: 'G Major', notes: ['G3', 'B3', 'D4'] },
  { label: 'A Minor', notes: ['A3', 'C4', 'E4'] },
];

export const KeyboardScreen: React.FC<Props> = ({ room, selfName, onBackToLobby }) => {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [preset, setPreset] = useState<SynthPreset>('lead');

  const triggerNote = (note: string) => {
    setActiveNotes(prev => new Set(prev).add(note));
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }, 250);

    // Play locally
    KeySynth.playNote(note, undefined, 0.4, 0.8, preset);

    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch (_e) {}

    // Broadcast event to band room
    socketClient.sendNoteEvent({
      roomId: room.code,
      senderName: selfName,
      instrument: 'keyboard',
      note,
      velocity: 0.8,
      duration: 400,
      timestamp: Date.now(),
    });
  };

  const playChord = (notes: string[]) => {
    notes.forEach(note => triggerNote(note));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToLobby}>
          <Text style={styles.backBtnText}>← BAND LOBBY</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>🎹 SYNTH STAGE</Text>
      </View>

      {/* Preset Picker */}
      <View style={styles.presetBar}>
        <Text style={styles.presetLabel}>SYNTH PRESET:</Text>
        {(['lead', 'pad', 'epiano', 'brass'] as SynthPreset[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.presetBtn, preset === p ? styles.presetBtnActive : null]}
            onPress={() => setPreset(p)}
          >
            <Text style={[styles.presetText, preset === p ? styles.presetTextActive : null]}>
              {p.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chord Helpers */}
      <View style={styles.chordBar}>
        <Text style={styles.chordTitle}>QUICK CHORDS:</Text>
        <View style={styles.chordRow}>
          {CHORDS.map(chord => (
            <TouchableOpacity
              key={chord.label}
              style={styles.chordBtn}
              onPress={() => playChord(chord.notes)}
            >
              <Text style={styles.chordBtnText}>{chord.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interactive Piano Keyboard */}
      <View style={styles.keyboardContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.keysScroll}>
          <View style={styles.keysRow}>
            {KEYS.map(k => {
              const isActive = activeNotes.has(k.note);
              return (
                <TouchableOpacity
                  key={k.note}
                  style={[
                    k.isBlack ? styles.blackKey : styles.whiteKey,
                    isActive ? (k.isBlack ? styles.blackKeyActive : styles.whiteKeyActive) : null,
                  ]}
                  onPress={() => triggerNote(k.note)}
                  activeOpacity={0.7}
                >
                  <Text style={k.isBlack ? styles.blackKeyText : styles.whiteKeyText}>
                    {k.note}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
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
    color: '#89B4FA',
    fontSize: 16,
    fontWeight: '900',
  },
  presetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#313244',
  },
  presetLabel: {
    color: '#A6ADC8',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 8,
  },
  presetBtn: {
    backgroundColor: '#181825',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#313244',
  },
  presetBtnActive: {
    backgroundColor: '#89B4FA',
    borderColor: '#89B4FA',
  },
  presetText: {
    color: '#CDD6F4',
    fontSize: 10,
    fontWeight: '700',
  },
  presetTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  chordBar: {
    marginBottom: 12,
  },
  chordTitle: {
    color: '#A6ADC8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
  },
  chordRow: {
    flexDirection: 'row',
  },
  chordBtn: {
    backgroundColor: '#313244',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  chordBtnText: {
    color: '#F9E2AF',
    fontSize: 12,
    fontWeight: '800',
  },
  keyboardContainer: {
    height: 220,
    backgroundColor: '#181825',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#313244',
    justifyContent: 'center',
  },
  keysScroll: {
    flexDirection: 'row',
  },
  keysRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  whiteKey: {
    width: 48,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginRight: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  whiteKeyActive: {
    backgroundColor: '#00E676',
  },
  whiteKeyText: {
    color: '#333',
    fontWeight: '800',
    fontSize: 11,
  },
  blackKey: {
    width: 36,
    height: 110,
    backgroundColor: '#1E1E2E',
    borderRadius: 6,
    marginRight: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#89B4FA',
    zIndex: 2,
  },
  blackKeyActive: {
    backgroundColor: '#89B4FA',
  },
  blackKeyText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 9,
  },
});
