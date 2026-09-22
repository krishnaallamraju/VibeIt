import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TransportState } from '../types';
import { theme } from '../styles/theme';

interface Props {
  transport: TransportState;
  isHost: boolean;
  isRecording?: boolean;
  onUpdateTransport: (updates: Partial<TransportState>) => void;
  onToggleRecord?: () => void;
}

const KEYS = ['C Major', 'A Minor', 'Pentatonic', 'Funk Blues'];

export const BPMControl: React.FC<Props> = ({
  transport,
  isHost,
  isRecording,
  onUpdateTransport,
  onToggleRecord,
}) => {
  const handleBPMChange = (delta: number) => {
    if (!isHost) return;
    const newBpm = Math.max(60, Math.min(220, transport.bpm + delta));
    onUpdateTransport({ bpm: newBpm });
  };

  const togglePlay = () => {
    if (!isHost) return;
    onUpdateTransport({ isPlaying: !transport.isPlaying });
  };

  const handleKeyCycle = () => {
    if (!isHost) return;
    const currentIdx = KEYS.indexOf(transport.key || 'C Major');
    const nextKey = KEYS[(currentIdx + 1) % KEYS.length];
    onUpdateTransport({ key: nextKey });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        {/* BPM Counter */}
        <View style={styles.bpmSection}>
          <Text style={styles.label}>TEMPO (BPM)</Text>
          <View style={styles.counterRow}>
            {isHost && (
              <TouchableOpacity style={styles.stepBtn} onPress={() => handleBPMChange(-5)}>
                <Text style={styles.stepBtnText}>-5</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.bpmValue}>{transport.bpm}</Text>
            {isHost && (
              <TouchableOpacity style={styles.stepBtn} onPress={() => handleBPMChange(+5)}>
                <Text style={styles.stepBtnText}>+5</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Master Play Button (Circular Dribbble Player Style) */}
        <TouchableOpacity
          style={[
            styles.playCircle,
            transport.isPlaying ? styles.pauseCircle : null,
            !isHost ? styles.disabledPlay : null,
          ]}
          onPress={togglePlay}
          disabled={!isHost}
        >
          <Text style={styles.playIcon}>{transport.isPlaying ? '⏸' : '▶'}</Text>
          <Text style={styles.playText}>{transport.isPlaying ? 'PAUSE' : 'JAM'}</Text>
        </TouchableOpacity>

        {/* Record Button */}
        {onToggleRecord && (
          <TouchableOpacity
            style={[styles.recPill, isRecording ? styles.recPillActive : null]}
            onPress={onToggleRecord}
          >
            <View style={[styles.recDot, isRecording ? styles.recDotActive : null]} />
            <Text style={styles.recText}>{isRecording ? 'REC' : 'REC'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Key & Scale Selector */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.keyTag} onPress={handleKeyCycle} disabled={!isHost}>
          <Text style={styles.keyTagLabel}>SCALE LOCK:</Text>
          <Text style={styles.keyTagValue}>{transport.key || 'C Major'}</Text>
        </TouchableOpacity>

        <View style={styles.syncBadge}>
          <View style={[styles.pulseDot, transport.isPlaying ? styles.pulseDotActive : null]} />
          <Text style={styles.syncText}>
            {transport.isPlaying ? 'MASTER SYNC' : 'STANDBY'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bpmSection: {
    alignItems: 'flex-start',
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  bpmValue: {
    color: theme.colors.secondary,
    fontSize: 26,
    fontWeight: '900',
    marginHorizontal: 8,
  },
  stepBtn: {
    backgroundColor: theme.colors.cardBgSecondary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    fontSize: 11,
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  pauseCircle: {
    backgroundColor: theme.colors.pink,
    shadowColor: theme.colors.pink,
  },
  disabledPlay: {
    opacity: 0.5,
  },
  playIcon: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },
  playText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 1,
  },
  recPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recPillActive: {
    backgroundColor: 'rgba(255, 42, 117, 0.2)',
    borderColor: theme.colors.pink,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textMuted,
    marginRight: 6,
  },
  recDotActive: {
    backgroundColor: theme.colors.pink,
  },
  recText: {
    color: theme.colors.textPrimary,
    fontWeight: '900',
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
  },
  keyTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyTagLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginRight: 6,
  },
  keyTagValue: {
    color: theme.colors.yellow,
    fontWeight: '800',
    fontSize: 12,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textMuted,
    marginRight: 6,
  },
  pulseDotActive: {
    backgroundColor: theme.colors.green,
  },
  syncText: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
});
