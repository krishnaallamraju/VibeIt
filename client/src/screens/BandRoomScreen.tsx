import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Room, InstrumentType, TransportState } from '../types';
import { MemberBadge } from '../components/MemberBadge';
import { BPMControl } from '../components/BPMControl';
import { QRModal } from '../components/QRModal';
import { socketClient } from '../network/SocketClient';
import { theme } from '../styles/theme';

interface Props {
  room: Room;
  selfId: string;
  onEnterInstrument: () => void;
  onLeaveRoom: () => void;
}

const INSTRUMENT_OPTIONS: { id: InstrumentType; label: string; desc: string; icon: string; color: string }[] = [
  { id: 'drums', label: 'AI Drums', desc: 'Touch pads + motion sensor shake/tap strike', icon: '🥁', color: '#FF2A75' },
  { id: 'keyboard', label: 'Synth Piano', desc: 'Dual-octave piano + scale highlighter', icon: '🎹', color: '#7C3AED' },
  { id: 'bass', label: 'Bass Guitar', desc: 'Sub-bass fretboard + slap/pluck tones', icon: '🎸', color: '#00E5FF' },
  { id: 'vocals', label: 'AI Vocals', desc: 'Microphone pitch detection + autotune', icon: '🎤', color: '#FFC107' },
  { id: 'bandmate', label: 'AI Bandmate', desc: 'Co-pilot auto-accompaniment generator', icon: '🤖', color: '#00E676' },
];

export const BandRoomScreen: React.FC<Props> = ({
  room,
  selfId,
  onEnterInstrument,
  onLeaveRoom,
}) => {
  const [showQR, setShowQR] = useState(false);
  const selfMember = room.members.find(m => m.id === selfId);
  const isHost = selfMember?.isHost || false;

  const handleSelectInstrument = (instr: InstrumentType) => {
    socketClient.selectInstrument(room.code, instr);
  };

  const handleUpdateTransport = (updates: Partial<TransportState>) => {
    socketClient.sendTransportControl(room.code, updates);
  };

  const handleToggleRecord = () => {
    socketClient.toggleRecording(room.code);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Sleek Dribbble Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.leaveBtn} onPress={onLeaveRoom}>
          <Text style={styles.leaveBtnText}>← LEAVE</Text>
        </TouchableOpacity>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <Text style={styles.codeVal}>{room.code}</Text>
        </View>

        <TouchableOpacity style={styles.qrBtn} onPress={() => setShowQR(true)}>
          <Text style={styles.qrBtnText}>📱 QR</Text>
        </TouchableOpacity>
      </View>

      {/* BPM & Master Transport */}
      <BPMControl
        transport={room.transport}
        isHost={isHost}
        isRecording={room.isRecording}
        onUpdateTransport={handleUpdateTransport}
        onToggleRecord={handleToggleRecord}
      />

      {/* Connected Members */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>BAND MEMBERS ({room.members.length})</Text>
        <Text style={styles.syncStatusText}>⚡ REALTIME SYNC ACTIVE</Text>
      </View>

      <View style={styles.membersGrid}>
        {room.members.map(member => (
          <View key={member.id} style={{ width: '50%' }}>
            <MemberBadge member={member} isSelf={member.id === selfId} />
          </View>
        ))}
      </View>

      {/* Instrument Selection */}
      <Text style={styles.sectionTitle}>CHOOSE YOUR INSTRUMENT</Text>
      <View style={styles.instrList}>
        {INSTRUMENT_OPTIONS.map(opt => {
          const isSelected = selfMember?.instrument === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.instrCard,
                isSelected ? { borderColor: opt.color, backgroundColor: 'rgba(124, 58, 237, 0.15)' } : null,
              ]}
              onPress={() => handleSelectInstrument(opt.id)}
            >
              <View style={[styles.iconCircle, { backgroundColor: opt.color }]}>
                <Text style={styles.instrIcon}>{opt.icon}</Text>
              </View>
              <View style={styles.instrInfo}>
                <Text style={[styles.instrTitle, isSelected ? { color: opt.color, fontWeight: '900' } : null]}>
                  {opt.label}
                </Text>
                <Text style={styles.instrDesc}>{opt.desc}</Text>
              </View>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: opt.color }]}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Enter Stage Button */}
      <TouchableOpacity style={styles.enterStageBtn} onPress={onEnterInstrument}>
        <Text style={styles.enterStageText}>🔥 ENTER STAGE ({selfMember?.instrument.toUpperCase()})</Text>
      </TouchableOpacity>

      <QRModal visible={showQR} roomCode={room.code} onClose={() => setShowQR(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.colors.background,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leaveBtn: {
    backgroundColor: theme.colors.cardBgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  leaveBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  codeContainer: {
    alignItems: 'center',
  },
  codeLabel: {
    color: theme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  codeVal: {
    color: theme.colors.secondary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 3,
  },
  qrBtn: {
    backgroundColor: theme.colors.cardBgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  qrBtnText: {
    color: theme.colors.secondary,
    fontWeight: '800',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 10,
    marginBottom: 8,
  },
  syncStatusText: {
    color: theme.colors.green,
    fontSize: 10,
    fontWeight: '800',
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  instrList: {
    marginVertical: 4,
  },
  instrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instrIcon: {
    fontSize: 22,
  },
  instrInfo: {
    flex: 1,
  },
  instrTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  instrDesc: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  enterStageBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginTop: 14,
    ...theme.shadows.glowPrimary,
  },
  enterStageText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
