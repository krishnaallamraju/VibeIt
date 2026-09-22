import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { socketClient } from '../network/SocketClient';
import { NoteEvent, Room } from '../types';
import { BeatQuantizer } from '../audio/BeatQuantizer';
import { ntpClock } from '../network/NTPClock';

interface Props {
  room: Room;
  onBackToLobby: () => void;
}

export const RecordingScreen: React.FC<Props> = ({ room, onBackToLobby }) => {
  const [eventStream, setEventStream] = useState<NoteEvent[]>([]);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  useEffect(() => {
    const unsub = socketClient.onNoteEvent(event => {
      setEventStream(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    });
    return () => unsub();
  }, []);

  const handleReplaySession = () => {
    if (eventStream.length === 0) return;
    setIsPlayingBack(true);

    const clockOffset = ntpClock.getOffset();
    // Schedule replay of captured events
    eventStream.forEach((evt, idx) => {
      setTimeout(() => {
        BeatQuantizer.playNoteEvent(evt, clockOffset);
      }, idx * 250);
    });

    setTimeout(() => {
      setIsPlayingBack(false);
    }, eventStream.length * 250 + 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToLobby}>
          <Text style={styles.backBtnText}>← BAND LOBBY</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>🎙 RECORDING STUDIO</Text>
      </View>

      <View style={styles.statusBox}>
        <View style={styles.statusHeader}>
          <View style={[styles.recDot, room.isRecording ? styles.recDotActive : null]} />
          <Text style={styles.statusTitle}>
            {room.isRecording ? 'LIVE PERFORMANCE RECORDING IN PROGRESS' : 'RECORDING STANDBY'}
          </Text>
        </View>
        <Text style={styles.statsText}>
          Captured Events: {room.history ? room.history.length : eventStream.length} • BPM: {room.transport.bpm}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.replayBtn, isPlayingBack ? styles.replayBtnActive : null]}
        onPress={handleReplaySession}
        disabled={isPlayingBack}
      >
        <Text style={styles.replayBtnText}>
          {isPlayingBack ? '🔊 REPLAYING PERFORMANCE...' : '▶ REPLAY RECENT SESSION EVENTS'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.streamTitle}>LIVE EVENT STREAM TIMELINE</Text>
      <FlatList
        data={eventStream}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventRow}>
            <Text style={styles.eventTime}>
              {new Date(item.timestamp).toLocaleTimeString().split(' ')[0]}
            </Text>
            <Text style={styles.eventSender}>{item.senderName}</Text>
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>{item.instrument.toUpperCase()}</Text>
            </View>
            <Text style={styles.eventNote}>{item.note}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No events recorded yet. Play notes on any phone!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#11111B',
    flex: 1,
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
    color: '#FF33A8',
    fontSize: 16,
    fontWeight: '900',
  },
  statusBox: {
    backgroundColor: '#1E1E2E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#313244',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A6ADC8',
    marginRight: 8,
  },
  recDotActive: {
    backgroundColor: '#FF3348',
  },
  statusTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  statsText: {
    color: '#A6ADC8',
    fontSize: 11,
    marginTop: 4,
  },
  replayBtn: {
    backgroundColor: '#FF33A8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  replayBtnActive: {
    backgroundColor: '#313244',
  },
  replayBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
  },
  streamTitle: {
    color: '#89B4FA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181825',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#313244',
  },
  eventTime: {
    color: '#A6ADC8',
    fontSize: 10,
    width: 60,
  },
  eventSender: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
    flex: 1,
  },
  eventBadge: {
    backgroundColor: '#313244',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  eventBadgeText: {
    color: '#89B4FA',
    fontSize: 9,
    fontWeight: '800',
  },
  eventNote: {
    color: '#00E676',
    fontWeight: '900',
    fontSize: 14,
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A6ADC8',
    fontSize: 12,
  },
});
