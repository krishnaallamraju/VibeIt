import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { socketClient } from '../network/SocketClient';
import { Room, AIBandmateConfig } from '../types';

interface Props {
  room: Room;
  selfName: string;
  onBackToLobby: () => void;
}

const STYLES = ['funk', 'rock', 'lofi', 'edm', 'jazz'] as const;
const TARGETS = [
  { id: 'drums', label: '🥁 AI Drums' },
  { id: 'bass', label: '🎸 AI Bass' },
  { id: 'keyboard', label: '🎹 AI Keys' },
] as const;

export const AIBandmateScreen: React.FC<Props> = ({ room, selfName, onBackToLobby }) => {
  const [style, setStyle] = useState<'funk' | 'rock' | 'lofi' | 'edm' | 'jazz'>('funk');
  const [targetInstrument, setTargetInstrument] = useState<'drums' | 'bass' | 'keyboard'>('bass');
  const [complexity, setComplexity] = useState(3);
  const [autoAccompaniment, setAutoAccompaniment] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    const config: AIBandmateConfig = {
      style,
      complexity,
      autoAccompaniment,
      targetInstrument,
    };

    socketClient.requestAIBandmate(room.code, config);

    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToLobby}>
          <Text style={styles.backBtnText}>← BAND LOBBY</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>🤖 AI BANDMATE CO-PILOT</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>CONTEXT-AWARE AI COMPLEMENT</Text>
        <Text style={styles.infoDesc}>
          AI analyzes the band's current BPM ({room.transport.bpm}), scale ({room.transport.key}), and active members to generate synchronized groove patterns.
        </Text>
      </View>

      {/* Target Instrument picker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. CHOOSE AI ROLE</Text>
        <View style={styles.targetRow}>
          {TARGETS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.targetBtn,
                targetInstrument === t.id ? styles.targetBtnActive : null,
              ]}
              onPress={() => setTargetInstrument(t.id)}
            >
              <Text
                style={[
                  styles.targetText,
                  targetInstrument === t.id ? styles.targetTextActive : null,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Music Style Picker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. MUSIC GENRE / STYLE</Text>
        <View style={styles.styleRow}>
          {STYLES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.styleChip, style === s ? styles.styleChipActive : null]}
              onPress={() => setStyle(s)}
            >
              <Text style={[styles.styleChipText, style === s ? styles.styleChipTextActive : null]}>
                {s.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Complexity Selector */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>3. PATTERN COMPLEXITY LEVEL: {complexity}</Text>
        <View style={styles.complexityRow}>
          {[1, 2, 3, 4, 5].map(lvl => (
            <TouchableOpacity
              key={lvl}
              style={[
                styles.lvlBtn,
                complexity === lvl ? styles.lvlBtnActive : null,
              ]}
              onPress={() => setComplexity(lvl)}
            >
              <Text style={[styles.lvlText, complexity === lvl ? styles.lvlTextActive : null]}>
                L{lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Generate Actions */}
      <TouchableOpacity
        style={[styles.generateBtn, isGenerating ? styles.generateBtnLoading : null]}
        onPress={handleGenerate}
        disabled={isGenerating}
      >
        <Text style={styles.generateBtnText}>
          {isGenerating ? '⚡ COMPOSING PATTERN...' : '✨ AUTO-GENERATE COMPLEMENTARY PATTERN'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fillBtn} onPress={handleGenerate}>
        <Text style={styles.fillBtnText}>💥 TRIGGER LIVE AI DRUM/BASS FILL</Text>
      </TouchableOpacity>
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
    color: '#33FFF5',
    fontSize: 16,
    fontWeight: '900',
  },
  infoCard: {
    backgroundColor: '#1E1E2E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#33FFF5',
  },
  infoTitle: {
    color: '#33FFF5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoDesc: {
    color: '#A6ADC8',
    fontSize: 11,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#181825',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#313244',
  },
  cardTitle: {
    color: '#89B4FA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetBtn: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#313244',
  },
  targetBtnActive: {
    backgroundColor: '#33FFF5',
    borderColor: '#33FFF5',
  },
  targetText: {
    color: '#CDD6F4',
    fontSize: 11,
    fontWeight: '700',
  },
  targetTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  styleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  styleChip: {
    backgroundColor: '#1E1E2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#313244',
  },
  styleChipActive: {
    backgroundColor: '#33FFF5',
    borderColor: '#33FFF5',
  },
  styleChipText: {
    color: '#CDD6F4',
    fontSize: 11,
    fontWeight: '700',
  },
  styleChipTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  complexityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lvlBtn: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#313244',
  },
  lvlBtnActive: {
    backgroundColor: '#F9E2AF',
    borderColor: '#F9E2AF',
  },
  lvlText: {
    color: '#CDD6F4',
    fontWeight: '700',
    fontSize: 11,
  },
  lvlTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  generateBtn: {
    backgroundColor: '#33FFF5',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#33FFF5',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  generateBtnLoading: {
    backgroundColor: '#313244',
  },
  generateBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  },
  fillBtn: {
    backgroundColor: '#FF33A8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  fillBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
  },
});
