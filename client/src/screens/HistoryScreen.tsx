import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { PerformanceSession } from '../types';
import { BeatQuantizer } from '../audio/BeatQuantizer';
import { ntpClock } from '../network/NTPClock';

interface Props {
  onBackToHome: () => void;
}

export const HistoryScreen: React.FC<Props> = ({ onBackToHome }) => {
  const [performances, setPerformances] = useState<PerformanceSession[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch performances from server REST API
    let serverUrl = 'http://localhost:4000';
    if (typeof window !== 'undefined' && window.location) {
      serverUrl = `http://${window.location.hostname}:4000`;
    }

    fetch(`${serverUrl}/api/performances`)
      .then(res => res.json())
      .then(data => {
        if (data.performances) {
          setPerformances(data.performances);
        }
      })
      .catch(err => console.warn('Failed to fetch performances:', err));
  }, []);

  const playPerformance = (session: PerformanceSession) => {
    setPlayingId(session.id);
    const clockOffset = ntpClock.getOffset();

    session.events.forEach((evt, idx) => {
      setTimeout(() => {
        BeatQuantizer.playNoteEvent(evt, clockOffset);
      }, idx * 200);
    });

    setTimeout(() => {
      setPlayingId(null);
    }, session.events.length * 200 + 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToHome}>
          <Text style={styles.backBtnText}>← HOME</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>🎙 SAVED PERFORMANCES</Text>
      </View>

      <FlatList
        data={performances}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isPlaying = playingId === item.id;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Duration: {item.duration}s</Text>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>BPM: {item.bpm}</Text>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>Events: {item.eventsCount}</Text>
              </View>

              <TouchableOpacity
                style={[styles.playBtn, isPlaying ? styles.playBtnActive : null]}
                onPress={() => playPerformance(item)}
                disabled={isPlaying}
              >
                <Text style={styles.playBtnText}>
                  {isPlaying ? '🔊 PLAYING PERFORMANCE...' : '▶ REPLAY BAND PERFORMANCE'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🎙</Text>
            <Text style={styles.emptyTitle}>NO SAVED PERFORMANCES YET</Text>
            <Text style={styles.emptyDesc}>
              Create or join a band room, press REC during a live performance, and your session will be saved here!
            </Text>
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
    marginBottom: 14,
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
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#313244',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#00E676',
    fontSize: 16,
    fontWeight: '800',
  },
  cardDate: {
    color: '#A6ADC8',
    fontSize: 11,
  },
  metaRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  metaText: {
    color: '#CDD6F4',
    fontSize: 11,
    marginRight: 6,
  },
  playBtn: {
    backgroundColor: '#00E676',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  playBtnActive: {
    backgroundColor: '#313244',
  },
  playBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDesc: {
    color: '#A6ADC8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
});
