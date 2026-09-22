import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { socketClient } from '../network/SocketClient';
import { InstrumentType } from '../types';
import { theme } from '../styles/theme';

interface Props {
  onRoomJoined: (code: string) => void;
  onOpenHistory: () => void;
}

const INSTRUMENT_CAROUSEL: {
  id: InstrumentType;
  label: string;
  sub: string;
  icon: string;
  color: string;
  gradient: string;
}[] = [
  { id: 'drums', label: 'AI Drums', sub: 'Motion Strike & Tap', icon: '🥁', color: '#FF2A75', gradient: 'rgba(255, 42, 117, 0.15)' },
  { id: 'keyboard', label: 'Synth Piano', sub: 'Polyphonic ADSR', icon: '🎹', color: '#7C3AED', gradient: 'rgba(124, 58, 237, 0.15)' },
  { id: 'bass', label: 'Bass Guitar', sub: 'Sub-Bass & Slap', icon: '🎸', color: '#00E5FF', gradient: 'rgba(0, 229, 255, 0.15)' },
  { id: 'vocals', label: 'AI Vocals', sub: 'Mic Pitch Autotune', icon: '🎤', color: '#FFC107', gradient: 'rgba(255, 193, 7, 0.15)' },
  { id: 'bandmate', label: 'AI Bandmate', sub: 'Co-Pilot Accompaniment', icon: '🤖', color: '#00E676', gradient: 'rgba(0, 230, 118, 0.15)' },
];

export const HomeScreen: React.FC<Props> = ({ onRoomJoined, onOpenHistory }) => {
  const [name, setName] = useState('Karthik');
  const [roomCode, setRoomCode] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('drums');
  const [errorMsg, setErrorMsg] = useState('');
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverIp, setServerIp] = useState(socketClient.getServerUrl());

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('room');
      if (code) {
        setRoomCode(code.toUpperCase());
      }
    }

    const unsubError = socketClient.onError(err => {
      setErrorMsg(err);
      if (err && err.includes('Cannot connect')) {
        setShowServerConfig(true);
      }
    });

    return () => unsubError();
  }, []);

  const handleCreateRoom = () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your stage name');
      return;
    }
    setErrorMsg('');
    socketClient.createRoom(name, selectedInstrument);
  };

  const handleJoinRoom = () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your stage name');
      return;
    }
    if (!roomCode.trim()) {
      setErrorMsg('Please enter a 6-character room code');
      return;
    }
    setErrorMsg('');
    socketClient.joinRoom(roomCode.trim().toUpperCase(), name);
  };

  const handleSaveServerIp = (ipToUse?: string) => {
    const targetIp = ipToUse || serverIp;
    if (targetIp.trim()) {
      setServerIp(targetIp.trim());
      socketClient.setServerUrl(targetIp.trim());
      setErrorMsg('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Vinyl Visualizer Hero Header */}
      <View style={styles.heroWrapper}>
        <View style={styles.vinylContainer}>
          <View style={styles.vinylDisc}>
            <View style={styles.vinylRing1} />
            <View style={styles.vinylRing2} />
            <View style={styles.vinylCenter}>
              <Text style={styles.vinylCenterIcon}>🎸</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.liveTag}
          onPress={() => setShowServerConfig(!showServerConfig)}
        >
          <View style={styles.liveDot} />
          <Text style={styles.liveTagText}>SERVER: {socketClient.getServerUrl()} (TAP TO EDIT)</Text>
        </TouchableOpacity>

        <Text style={styles.heroTitle}>VIBEIT</Text>
        <Text style={styles.heroSubtitle}>
          Turn multiple smartphones into one synchronized AI-powered musical band. Join rooms, assign instruments, and perform live!
        </Text>

        {/* APK Download Button for Mobile Players */}
        <TouchableOpacity
          style={styles.downloadApkBtn}
          onPress={() => {
            const downloadUrl = `${socketClient.getServerUrl()}/download-apk`;
            if (typeof window !== 'undefined') {
              window.open(downloadUrl, '_blank');
            }
          }}
        >
          <Text style={styles.downloadApkIcon}>🤖</Text>
          <View style={styles.downloadApkInfo}>
            <Text style={styles.downloadApkTitle}>DOWNLOAD ANDROID APK</Text>
            <Text style={styles.downloadApkSub}>Install VibeIt on your smartphone for lowest audio latency</Text>
          </View>
          <Text style={styles.downloadApkArrow}>⬇</Text>
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {errorMsg ? (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => setShowServerConfig(true)}
        >
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          <Text style={styles.errorSubText}>Tap here to change backend server IP address ↓</Text>
        </TouchableOpacity>
      ) : null}

      {/* Server Config Drawer */}
      {showServerConfig && (
        <View style={styles.serverConfigBox}>
          <Text style={styles.serverConfigTitle}>⚙️ BACKEND SERVER CONNECTION SETTINGS</Text>
          <Text style={styles.serverConfigDesc}>
            Choose or enter your server URL to connect your phone to the VibeIt backend:
          </Text>

          <View style={styles.presetIpRow}>
            <TouchableOpacity
              style={styles.presetIpBtn}
              onPress={() => handleSaveServerIp('https://vibeit-master-server.loca.lt')}
            >
              <Text style={styles.presetIpBtnText}>🌐 Cloud Tunnel (vibeit-master-server.loca.lt)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetIpBtn, { backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: theme.colors.primary, marginTop: 6 }]}
              onPress={() => handleSaveServerIp('http://10.188.203.113:4000')}
            >
              <Text style={[styles.presetIpBtnText, { color: theme.colors.primary }]}>⚡ Host Wi-Fi IP (10.188.203.113:4000)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetIpBtnSecondary, { marginTop: 6 }]}
              onPress={() => handleSaveServerIp('http://localhost:4000')}
            >
              <Text style={styles.presetIpBtnTextSecondary}>💻 Localhost (localhost:4000)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.serverIpRow}>
            <TextInput
              style={styles.serverIpInput}
              placeholder="e.g. https://vibeit-master-server.loca.lt"
              placeholderTextColor={theme.colors.textMuted}
              value={serverIp}
              onChangeText={setServerIp}
            />
            <TouchableOpacity style={styles.saveIpBtn} onPress={() => handleSaveServerIp()}>
              <Text style={styles.saveIpBtnText}>CONNECT</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Stage Profile & Instrument Picker */}
      <View style={styles.glassCard}>
        <Text style={styles.sectionTitle}>1. PLAYER STAGE NAME</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Enter your name (e.g., Karthik, Jimi, Lars)"
          placeholderTextColor={theme.colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.sectionTitle}>2. CHOOSE STARTING INSTRUMENT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselScroll}>
          <View style={styles.carouselRow}>
            {INSTRUMENT_CAROUSEL.map(item => {
              const isSelected = selectedInstrument === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.instrCard,
                    { backgroundColor: isSelected ? item.gradient : theme.colors.cardBgSecondary },
                    isSelected ? { borderColor: item.color } : null,
                  ]}
                  onPress={() => setSelectedInstrument(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.instrIconCircle, { backgroundColor: item.color }]}>
                    <Text style={styles.instrIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.instrLabel, isSelected ? { color: item.color, fontWeight: '900' } : null]}>
                    {item.label}
                  </Text>
                  <Text style={styles.instrSub}>{item.sub}</Text>
                  {isSelected && (
                    <View style={[styles.selectedPill, { backgroundColor: item.color }]}>
                      <Text style={styles.selectedPillText}>SELECTED</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Action Deck (Create vs Join) */}
      <View style={styles.actionGrid}>
        {/* Create Band Room */}
        <View style={[styles.actionCard, { marginRight: 6 }]}>
          <Text style={styles.actionTitle}>CREATE A BAND</Text>
          <Text style={styles.actionDesc}>Host a new session as Band Leader with room code/QR.</Text>
          <TouchableOpacity style={styles.createBtn} onPress={handleCreateRoom}>
            <Text style={styles.createBtnText}>+ CREATE ROOM</Text>
          </TouchableOpacity>
        </View>

        {/* Join Band Room */}
        <View style={[styles.actionCard, { marginLeft: 6 }]}>
          <Text style={styles.actionTitle}>JOIN BAND</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="6-DIGIT CODE"
            placeholderTextColor={theme.colors.textMuted}
            value={roomCode}
            onChangeText={t => setRoomCode(t.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoinRoom}>
            <Text style={styles.joinBtnText}>JOIN ROOM</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Performances Library Quick Launcher */}
      <TouchableOpacity style={styles.historyCard} onPress={onOpenHistory}>
        <View style={styles.historyIconBox}>
          <Text style={styles.historyIcon}>🎙</Text>
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.historyTitle}>RECORDING STUDIO & HISTORY</Text>
          <Text style={styles.historySub}>View & replay saved multi-track band performances</Text>
        </View>
        <Text style={styles.historyArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.colors.background,
    minHeight: '100%',
  },
  heroWrapper: {
    alignItems: 'center',
    marginVertical: 14,
  },
  vinylContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  vinylDisc: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#141622',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2E45',
    position: 'relative',
  },
  vinylRing1: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vinylRing2: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  vinylCenter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylCenterIcon: {
    fontSize: 14,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.green,
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.green,
    marginRight: 6,
  },
  liveTagText: {
    color: theme.colors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 2,
  },
  heroSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: theme.colors.pink,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
  },
  errorText: {
    color: '#FFF',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 13,
  },
  errorSubText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
  },
  serverConfigBox: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
  },
  serverConfigTitle: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  serverConfigDesc: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 10,
  },
  presetIpRow: {
    marginBottom: 10,
  },
  presetIpBtn: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  presetIpBtnText: {
    color: theme.colors.secondary,
    fontWeight: '800',
    fontSize: 12,
  },
  presetIpBtnSecondary: {
    backgroundColor: theme.colors.cardBgSecondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  presetIpBtnTextSecondary: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  serverIpRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  serverIpInput: {
    flex: 1,
    backgroundColor: theme.colors.cardBgSecondary,
    color: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  saveIpBtn: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
  },
  saveIpBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
  },
  glassCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: theme.colors.cardBgSecondary,
    color: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  carouselScroll: {
    flexDirection: 'row',
  },
  carouselRow: {
    flexDirection: 'row',
  },
  instrCard: {
    width: 120,
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  instrIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  instrIcon: {
    fontSize: 22,
  },
  instrLabel: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  instrSub: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedPill: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  selectedPillText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  actionGrid: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'space-between',
  },
  actionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  actionDesc: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 12,
  },
  createBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.glowPrimary,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
  },
  codeInput: {
    backgroundColor: theme.colors.cardBgSecondary,
    color: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    letterSpacing: 2,
  },
  joinBtn: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  historyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.yellow,
  },
  historyIcon: {
    fontSize: 22,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    color: theme.colors.yellow,
    fontSize: 13,
    fontWeight: '800',
  },
  historySub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  historyArrow: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontWeight: '900',
  },
  downloadApkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 1.5,
    borderColor: '#00E676',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 18,
    width: '100%',
    maxWidth: 360,
  },
  downloadApkIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  downloadApkInfo: {
    flex: 1,
  },
  downloadApkTitle: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  downloadApkSub: {
    color: '#A6ADC8',
    fontSize: 11,
    marginTop: 2,
  },
  downloadApkArrow: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 8,
  },
});
