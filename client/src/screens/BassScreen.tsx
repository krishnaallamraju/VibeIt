import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { socketClient } from '../network/SocketClient';
import { BassSynth, BassStyle } from '../audio/BassSynth';
import { Room } from '../types';

interface Props {
  room: Room;
  selfName: string;
  onBackToLobby: () => void;
}

const BASS_STRINGS = [
  { stringName: 'E-STRING', notes: ['E1', 'F1', 'F#1', 'G1', 'G#1', 'A1'] },
  { stringName: 'A-STRING', notes: ['A1', 'A#1', 'B1', 'C2', 'C#2', 'D2'] },
  { stringName: 'D-STRING', notes: ['D2', 'D#2', 'E2', 'F2', 'F#2', 'G2'] },
  { stringName: 'G-STRING', notes: ['G2', 'G#2', 'A2', 'A#2', 'B2', 'C3'] },
];

export const BassScreen: React.FC<Props> = ({ room, selfName, onBackToLobby }) => {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [style, setStyle] = useState<BassStyle>('sub');

  const triggerBass = (note: string) => {
    setActiveNote(note);
    setTimeout(() => setActiveNote(null), 250);

    // Play locally
    BassSynth.playBass(note, undefined, 0.5, 0.9, style);

    // Broadcast event
    socketClient.sendNoteEvent({
      roomId: room.code,
      senderName: selfName,
      instrument: 'bass',
      note,
      velocity: 0.9,
      duration: 500,
      timestamp: Date.now(),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToLobby}>
          <Text style={styles.backBtnText}>← BAND LOBBY</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>🎸 BASS GUITAR STAGE</Text>
      </View>

      {/* Style Bar */}
      <View style={styles.styleBar}>
        <Text style={styles.styleLabel}>BASS TONE STYLE:</Text>
        {(['sub', 'slap', 'pluck'] as BassStyle[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.styleBtn, style === s ? styles.styleBtnActive : null]}
            onPress={() => setStyle(s)}
          >
            <Text style={[styles.styleText, style === s ? styles.styleTextActive : null]}>
              {s.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bass Fretboard Strings */}
      <View style={styles.fretboard}>
        {BASS_STRINGS.map((str, idx) => (
          <View key={str.stringName} style={styles.stringRow}>
            <View style={styles.stringHeader}>
              <Text style={styles.stringNameText}>{str.stringName}</Text>
              <View style={[styles.stringWire, { height: 2 + idx * 1.5 }]} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fretsScroll}>
              <View style={styles.fretsRow}>
                {str.notes.map(note => {
                  const isActive = activeNote === note;
                  return (
                    <TouchableOpacity
                      key={note}
                      style={[styles.fretNode, isActive ? styles.fretNodeActive : null]}
                      onPress={() => triggerBass(note)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.fretText, isActive ? styles.fretTextActive : null]}>
                        {note}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
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
    color: '#F333FF',
    fontSize: 16,
    fontWeight: '900',
  },
  styleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#313244',
  },
  styleLabel: {
    color: '#A6ADC8',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 8,
  },
  styleBtn: {
    backgroundColor: '#181825',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#313244',
  },
  styleBtnActive: {
    backgroundColor: '#F333FF',
    borderColor: '#F333FF',
  },
  styleText: {
    color: '#CDD6F4',
    fontSize: 10,
    fontWeight: '700',
  },
  styleTextActive: {
    color: '#FFF',
    fontWeight: '900',
  },
  fretboard: {
    backgroundColor: '#181825',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#313244',
  },
  stringRow: {
    marginBottom: 14,
  },
  stringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stringNameText: {
    color: '#F333FF',
    fontSize: 11,
    fontWeight: '900',
    width: 80,
  },
  stringWire: {
    flex: 1,
    backgroundColor: '#F333FF',
    borderRadius: 1,
  },
  fretsScroll: {
    flexDirection: 'row',
  },
  fretsRow: {
    flexDirection: 'row',
  },
  fretNode: {
    width: 54,
    height: 54,
    backgroundColor: '#1E1E2E',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#313244',
  },
  fretNodeActive: {
    backgroundColor: '#F333FF',
    borderColor: '#FFF',
    shadowColor: '#F333FF',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  fretText: {
    color: '#CDD6F4',
    fontSize: 13,
    fontWeight: '900',
  },
  fretTextActive: {
    color: '#FFF',
  },
});
