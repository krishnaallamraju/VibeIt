import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { socketClient } from '../network/SocketClient';
import { DrumSynth } from '../audio/DrumSynth';
import { MotionVisualizer } from '../components/MotionVisualizer';
import { GestureRecognizer, GestureType } from '../ai/GestureRecognizer';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Room } from '../types';

interface Props {
  room: Room;
  selfName: string;
  onBackToLobby: () => void;
}

const DRUM_PADS = [
  { id: 'kick', label: 'BASS KICK', icon: '💥', color: '#FF33A8' },
  { id: 'snare', label: 'SNARE DRUM', icon: '🥁', color: '#00E676' },
  { id: 'hihat_closed', label: 'HI-HAT (CLOSED)', icon: '⚡', color: '#33FFF5' },
  { id: 'hihat_open', label: 'HI-HAT (OPEN)', icon: '✨', color: '#3357FF' },
  { id: 'clap', label: 'HAND CLAP', icon: '👏', color: '#FFC300' },
  { id: 'tom_high', label: 'HIGH TOM', icon: '🎯', color: '#F333FF' },
  { id: 'tom_low', label: 'LOW TOM', icon: '🥁', color: '#FF5733' },
  { id: 'crash', label: 'CRASH CYMBAL', icon: '💥', color: '#FFD700' },
];

export const DrumsScreen: React.FC<Props> = ({ room, selfName, onBackToLobby }) => {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [useMotionAI, setUseMotionAI] = useState(false);
  const [motionData, setMotionData] = useState({ x: 0, y: 0, z: 0, magnitude: 0, lastGesture: 'none' });

  const gestureRecognizer = useState(() => new GestureRecognizer())[0];

  useEffect(() => {
    let handleMotion: (e: DeviceMotionEvent) => void;

    if (useMotionAI && typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      handleMotion = (event: DeviceMotionEvent) => {
        const accel = event.accelerationIncludingGravity || event.acceleration;
        if (accel) {
          const x = accel.x || 0;
          const y = accel.y || 0;
          const z = accel.z || 0;

          const res = gestureRecognizer.processSensorFrame({ x, y, z });
          setMotionData({
            x, y, z,
            magnitude: res.magnitude,
            lastGesture: res.gesture,
          });

          if (res.gesture === 'strike' || res.gesture === 'shake') {
            triggerPad(res.mappedNote, res.velocity);
          }
        }
      };

      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (handleMotion) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [useMotionAI]);

  const triggerPad = (padId: string, velocity = 0.9) => {
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 120);

    // Play local sound immediately
    DrumSynth.triggerPad(padId, undefined, velocity);

    // Tactile physical haptics on mobile
    try {
      Haptics.impact({ style: padId === 'kick' ? ImpactStyle.Heavy : ImpactStyle.Medium });
    } catch (_e) {}

    // Broadcast event over Socket.IO to connected band members
    socketClient.sendNoteEvent({
      roomId: room.code,
      senderName: selfName,
      instrument: 'drums',
      note: padId,
      velocity,
      timestamp: Date.now(),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToLobby}>
          <Text style={styles.backBtnText}>← BAND LOBBY</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>🥁 AI DRUMS STAGE</Text>
        <TouchableOpacity
          style={[styles.aiToggleBtn, useMotionAI ? styles.aiToggleBtnActive : null]}
          onPress={() => setUseMotionAI(!useMotionAI)}
        >
          <Text style={[styles.aiToggleText, useMotionAI ? styles.aiToggleTextActive : null]}>
            {useMotionAI ? '🤖 SENSOR ON' : '📱 MOTION AI'}
          </Text>
        </TouchableOpacity>
      </View>

      {useMotionAI && (
        <MotionVisualizer
          x={motionData.x}
          y={motionData.y}
          z={motionData.z}
          magnitude={motionData.magnitude}
          lastGesture={motionData.lastGesture}
        />
      )}

      {/* Drum Pad Grid */}
      <View style={styles.grid}>
        {DRUM_PADS.map(pad => {
          const isActive = activePad === pad.id;
          return (
            <TouchableOpacity
              key={pad.id}
              style={[
                styles.pad,
                { borderColor: pad.color },
                isActive ? { backgroundColor: pad.color } : null,
              ]}
              onPress={() => triggerPad(pad.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.padIcon}>{pad.icon}</Text>
              <Text style={[styles.padLabel, isActive ? styles.padLabelActive : null]}>
                {pad.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    color: '#00E676',
    fontSize: 16,
    fontWeight: '900',
  },
  aiToggleBtn: {
    backgroundColor: '#313244',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aiToggleBtnActive: {
    backgroundColor: '#00E676',
  },
  aiToggleText: {
    color: '#A6ADC8',
    fontSize: 11,
    fontWeight: '800',
  },
  aiToggleTextActive: {
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pad: {
    width: '48%',
    height: 110,
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  padIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  padLabel: {
    color: '#CDD6F4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  padLabelActive: {
    color: '#000',
  },
});
