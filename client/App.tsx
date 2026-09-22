import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity } from 'react-native';
import { socketClient } from './src/network/SocketClient';
import { BeatQuantizer } from './src/audio/BeatQuantizer';
import { ntpClock } from './src/network/NTPClock';
import { Room, NoteEvent } from './src/types';
import { theme } from './src/styles/theme';
import { StatusBar as CapStatusBar, Style } from '@capacitor/status-bar';

import { BottomDock, TabType } from './src/components/BottomDock';
import { HomeScreen } from './src/screens/HomeScreen';
import { BandRoomScreen } from './src/screens/BandRoomScreen';
import { DrumsScreen } from './src/screens/DrumsScreen';
import { KeyboardScreen } from './src/screens/KeyboardScreen';
import { BassScreen } from './src/screens/BassScreen';
import { VocalsScreen } from './src/screens/VocalsScreen';
import { AIBandmateScreen } from './src/screens/AIBandmateScreen';
import { RecordingScreen } from './src/screens/RecordingScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [room, setRoom] = useState<Room | null>(null);
  const [selfId, setSelfId] = useState<string>('');
  const [subView, setSubView] = useState<'lobby' | 'instrument' | 'history'>('lobby');

  useEffect(() => {
    // 0. Set Capacitor Status Bar for Android
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      try {
        CapStatusBar.setStyle({ style: Style.Dark });
        CapStatusBar.setBackgroundColor({ color: '#11111B' });
      } catch (_e) {}
    }

    // 1. Connect socket
    socketClient.connect();

    // 2. Room State Listener
    const unsubRoom = socketClient.onRoomUpdate(updatedRoom => {
      setRoom(updatedRoom);
      setSelfId(socketClient.getSocketId());
      if (updatedRoom && activeTab === 'home') {
        setActiveTab('stage');
        setSubView('lobby');
      }
    });

    // 3. Incoming Note Event Listener (Real-Time Synchronized Playback across phones)
    const unsubNote = socketClient.onNoteEvent((event: NoteEvent) => {
      if (event.senderId !== socketClient.getSocketId()) {
        const offset = ntpClock.getOffset();
        BeatQuantizer.playNoteEvent(event, offset);
      }
    });

    // 4. AI Sequence Batch Listener
    const unsubAI = socketClient.onAISequence(({ events }) => {
      const offset = ntpClock.getOffset();
      events.forEach(evt => {
        BeatQuantizer.playNoteEvent(evt, offset);
      });
    });

    return () => {
      unsubRoom();
      unsubNote();
      unsubAI();
    };
  }, [activeTab]);

  const handleLeaveRoom = () => {
    socketClient.leaveRoom();
    setRoom(null);
    setActiveTab('home');
    setSubView('lobby');
  };

  const getSelfName = (): string => {
    if (!room) return 'Player';
    const m = room.members.find(x => x.id === selfId);
    return m?.name || 'Player';
  };

  const getSelfInstrument = (): string => {
    if (!room) return 'drums';
    const m = room.members.find(x => x.id === selfId);
    return m?.instrument || 'drums';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Top Header Bar if joined room */}
      {room && (
        <View style={styles.topHeader}>
          <View style={styles.roomInfoBox}>
            <View style={styles.liveDot} />
            <Text style={styles.roomCodeText}>ROOM: {room.code}</Text>
          </View>
          <Text style={styles.instrumentBadgeText}>
            INSTRUMENT: {getSelfInstrument().toUpperCase()}
          </Text>
        </View>
      )}

      {/* Main Multi-Page Screen View */}
      <View style={styles.mainContent}>
        {/* Tab 1: HOME */}
        {activeTab === 'home' && (
          <HomeScreen
            onRoomJoined={() => {
              setActiveTab('stage');
              setSubView('lobby');
            }}
            onOpenHistory={() => {
              setActiveTab('sessions');
              setSubView('history');
            }}
          />
        )}

        {/* Tab 2: STAGE */}
        {activeTab === 'stage' && (
          <>
            {!room ? (
              <View style={styles.noRoomBox}>
                <Text style={styles.noRoomIcon}>🎸</Text>
                <Text style={styles.noRoomTitle}>NO ACTIVE BAND ROOM</Text>
                <Text style={styles.noRoomDesc}>
                  Create or join a band room from the Home tab to start playing with your band!
                </Text>
                <TouchableOpacity
                  style={styles.goHomeBtn}
                  onPress={() => setActiveTab('home')}
                >
                  <Text style={styles.goHomeBtnText}>GO TO HOME</Text>
                </TouchableOpacity>
              </View>
            ) : subView === 'lobby' ? (
              <BandRoomScreen
                room={room}
                selfId={selfId}
                onEnterInstrument={() => setSubView('instrument')}
                onLeaveRoom={handleLeaveRoom}
              />
            ) : (
              <>
                {getSelfInstrument() === 'drums' && (
                  <DrumsScreen
                    room={room}
                    selfName={getSelfName()}
                    onBackToLobby={() => setSubView('lobby')}
                  />
                )}
                {getSelfInstrument() === 'keyboard' && (
                  <KeyboardScreen
                    room={room}
                    selfName={getSelfName()}
                    onBackToLobby={() => setSubView('lobby')}
                  />
                )}
                {getSelfInstrument() === 'bass' && (
                  <BassScreen
                    room={room}
                    selfName={getSelfName()}
                    onBackToLobby={() => setSubView('lobby')}
                  />
                )}
                {getSelfInstrument() === 'vocals' && (
                  <VocalsScreen
                    room={room}
                    selfName={getSelfName()}
                    onBackToLobby={() => setSubView('lobby')}
                  />
                )}
                {getSelfInstrument() === 'bandmate' && (
                  <AIBandmateScreen
                    room={room}
                    selfName={getSelfName()}
                    onBackToLobby={() => setSubView('lobby')}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Tab 3: AI STUDIO */}
        {activeTab === 'ai' && (
          <AIBandmateScreen
            room={room || {
              code: 'POCKET',
              hostId: 'ai',
              members: [],
              transport: { isPlaying: false, bpm: 120, currentBeat: 0, masterStartTime: 0, countIn: 4, key: 'C Major' },
              history: [],
              isRecording: false,
            }}
            selfName={getSelfName()}
            onBackToLobby={() => setActiveTab('stage')}
          />
        )}

        {/* Tab 4: SESSIONS & HISTORY */}
        {activeTab === 'sessions' && (
          <>
            {subView === 'history' ? (
              <HistoryScreen onBackToHome={() => setActiveTab('home')} />
            ) : (
              <RecordingScreen
                room={room || {
                  code: 'POCKET',
                  hostId: 'ai',
                  members: [],
                  transport: { isPlaying: false, bpm: 120, currentBeat: 0, masterStartTime: 0, countIn: 4, key: 'C Major' },
                  history: [],
                  isRecording: false,
                }}
                onBackToLobby={() => setActiveTab('stage')}
              />
            )}
          </>
        )}
      </View>

      {/* Floating Bottom Navigation Dock */}
      <BottomDock
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          if (tab === 'sessions') setSubView('recording' as any);
        }}
        roomCode={room?.code}
        currentInstrument={getSelfInstrument()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  roomInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.green,
    marginRight: 6,
  },
  roomCodeText: {
    color: theme.colors.secondary,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  instrumentBadgeText: {
    color: theme.colors.yellow,
    fontSize: 11,
    fontWeight: '800',
  },
  mainContent: {
    flex: 1,
    paddingBottom: 70, // Buffer space for floating dock
  },
  noRoomBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noRoomIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noRoomTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  noRoomDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  goHomeBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    marginTop: 16,
  },
  goHomeBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
  },
});
