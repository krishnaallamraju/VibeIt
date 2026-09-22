import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { socketClient } from '../network/SocketClient';
import { InstrumentType } from '../types';
import { theme } from '../styles/theme';
import { KeySynth } from '../audio/KeySynth';
import { audioEngine } from '../audio/AudioEngine';

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
  { id: 'drums', label: 'AI Drums', sub: 'Motion & Tap', icon: '🥁', color: '#FF2A75', gradient: 'rgba(255, 42, 117, 0.2)' },
  { id: 'keyboard', label: 'Synth Piano', sub: 'Polyphonic ADSR', icon: '🎹', color: '#A855F7', gradient: 'rgba(168, 85, 247, 0.2)' },
  { id: 'bass', label: 'Bass Guitar', sub: 'Sub & Slap', icon: '🎸', color: '#00E5FF', gradient: 'rgba(0, 229, 255, 0.2)' },
  { id: 'vocals', label: 'AI Vocals', sub: 'Autotune & Pitch', icon: '🎤', color: '#F59E0B', gradient: 'rgba(245, 158, 11, 0.2)' },
  { id: 'bandmate', label: 'AI Bandmate', sub: 'Smart Accompanist', icon: '🤖', color: '#10B981', gradient: 'rgba(16, 185, 129, 0.2)' },
];

export const HomeScreen: React.FC<Props> = ({ onRoomJoined, onOpenHistory }) => {
  const [name, setName] = useState('Karthik');
  const [roomCode, setRoomCode] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('drums');
  const [errorMsg, setErrorMsg] = useState('');
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverIp, setServerIp] = useState(socketClient.getServerUrl());
  const [downloadToast, setDownloadToast] = useState('');
  const [isOrbActive, setIsOrbActive] = useState(false);

  const isNativeApp = typeof window !== 'undefined' && Boolean((window as any).Capacitor);

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

  const handleOrbPress = () => {
    setIsOrbActive(true);
    setTimeout(() => setIsOrbActive(false), 800);

    // Audio unlock and musical shimmer chime
    try {
      audioEngine.init();
      KeySynth.playNote('C4', undefined, 0.4, 0.7, 'pad');
      setTimeout(() => KeySynth.playNote('G4', undefined, 0.5, 0.75, 'pad'), 100);
      setTimeout(() => KeySynth.playNote('C5', undefined, 0.6, 0.8, 'pad'), 200);
    } catch (_e) {}
  };

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

  // Direct APK download for Vercel deployment and mobile browsers
  const handleDirectApkDownload = async () => {
    setDownloadToast('Starting VibeItzzz.apk download...');
    
    const localApkUrl = typeof window !== 'undefined' ? `${window.location.origin}/VibeItzzz.apk` : '/VibeItzzz.apk';
    const fallbackApkUrl = typeof window !== 'undefined' ? `${window.location.origin}/VibeIt.apk` : '/VibeIt.apk';
    const githubFallbackUrl = 'https://github.com/krishnaallamraju/VibeIt/raw/main/VibeIt.apk';

    let targetUrl = localApkUrl;

    if (typeof window !== 'undefined') {
      try {
        const check = await fetch(localApkUrl, { method: 'HEAD' });
        if (!check.ok) {
          const checkFallback = await fetch(fallbackApkUrl, { method: 'HEAD' });
          targetUrl = checkFallback.ok ? fallbackApkUrl : githubFallbackUrl;
        }
      } catch (_e) {
        targetUrl = githubFallbackUrl;
      }

      const a = document.createElement('a');
      a.href = targetUrl;
      a.download = 'VibeItzzz.apk';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch (_e) {}
      }, 1000);

      setDownloadToast('✅ Downloading VibeItzzz.apk! Open the file to install.');
      setTimeout(() => setDownloadToast(''), 6000);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header Bar (Matching Dribbble Identifying Songs Header) */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSub}>AI SOUND ENGINE</Text>
          <Text style={styles.headerTitle}>VibeItzzz</Text>
        </View>

        <View style={styles.headerActions}>
          {/* Avatar Profile */}
          <TouchableOpacity style={styles.avatarButton} activeOpacity={0.8}>
            <Text style={styles.avatarIcon}>👤</Text>
            <View style={styles.avatarOnlineDot} />
          </TouchableOpacity>

          {/* Settings / Config Button */}
          <TouchableOpacity
            style={[styles.settingsButton, showServerConfig ? styles.settingsButtonActive : null]}
            onPress={() => setShowServerConfig(!showServerConfig)}
            activeOpacity={0.8}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Banner */}
      {errorMsg ? (
        <TouchableOpacity style={styles.errorBanner} onPress={() => setShowServerConfig(true)}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          <Text style={styles.errorSubText}>Tap here to adjust server connection settings ↓</Text>
        </TouchableOpacity>
      ) : null}

      {/* Download Toast Notification */}
      {downloadToast ? (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{downloadToast}</Text>
        </View>
      ) : null}

      {/* Server Config Drawer */}
      {showServerConfig && (
        <View style={styles.serverConfigBox}>
          <Text style={styles.serverConfigTitle}>⚙️ BACKEND SERVER CONNECTION</Text>
          <Text style={styles.serverConfigDesc}>
            Current backend: {socketClient.getServerUrl()}
          </Text>

          <View style={styles.presetIpRow}>
            <TouchableOpacity
              style={styles.presetIpBtn}
              onPress={() => handleSaveServerIp('https://vibeit-master-server.loca.lt')}
            >
              <Text style={styles.presetIpBtnText}>🌐 Cloud Tunnel (vibeit-master-server.loca.lt)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetIpBtn, { backgroundColor: 'rgba(168, 85, 247, 0.15)', borderColor: '#A855F7', marginTop: 6 }]}
              onPress={() => handleSaveServerIp('http://10.188.203.113:4000')}
            >
              <Text style={[styles.presetIpBtnText, { color: '#C084FC' }]}>⚡ Host Wi-Fi IP (10.188.203.113:4000)</Text>
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
              placeholder="e.g. http://10.188.203.113:4000"
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

      {/* Central Luminous Sound Orb (Dribbble Hero Element) */}
      <View style={styles.orbHeroWrapper}>
        <TouchableOpacity
          style={styles.orbTouchContainer}
          onPress={handleOrbPress}
          activeOpacity={0.9}
        >
          {/* Multi-layer atmospheric ambient radial backlights */}
          <View style={styles.orbAmbientAura} />
          <View style={styles.orbSecondaryAura} />

          {/* Concentric Neon Swirl Rings */}
          <View style={[styles.orbOuterRing, isOrbActive ? styles.orbOuterRingActive : null]}>
            <View style={styles.orbGradientBorder} />
            <View style={styles.orbMiddleRing}>
              <View style={styles.orbInnerCore}>
                <Text style={styles.orbCoreIcon}>🎙</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Status indicator under Orb */}
        <View style={styles.listeningTag}>
          <View style={styles.pulsingDot} />
          <Text style={styles.listeningTagText}>
            {isOrbActive ? 'LISTENING & SYNCING...' : 'TAP ORB TO TEST SOUND & SYNC'}
          </Text>
        </View>

        {/* APK Download Button for Web / Vercel Mobile Users */}
        {!isNativeApp && (
          <TouchableOpacity
            style={styles.downloadApkCard}
            onPress={handleDirectApkDownload}
            activeOpacity={0.85}
          >
            <View style={styles.downloadApkBadge}>
              <Text style={styles.downloadApkBadgeText}>APK</Text>
            </View>
            <View style={styles.downloadApkInfo}>
              <Text style={styles.downloadApkTitle}>DOWNLOAD VIBEITZZZ APK</Text>
              <Text style={styles.downloadApkSub}>
                Direct Vercel Download • Low Latency & Haptics
              </Text>
            </View>
            <View style={styles.downloadApkAction}>
              <Text style={styles.downloadApkActionText}>⬇ GET</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* My Music / Band Sessions Card (Matching Dribbble Bottom Card) */}
      <View style={styles.myMusicSection}>
        <View style={styles.myMusicHeader}>
          <Text style={styles.myMusicTitle}>My Music</Text>
          <TouchableOpacity onPress={onOpenHistory}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.trackCard} onPress={onOpenHistory} activeOpacity={0.8}>
          <View style={styles.trackArtwork}>
            <Text style={styles.trackArtworkIcon}>🎸</Text>
          </View>
          <View style={styles.trackDetails}>
            <Text style={styles.trackTitle}>The Ascent</Text>
            <Text style={styles.trackArtist}>Generdyn • VibeItzzz Band Session</Text>
          </View>
          <Text style={styles.trackDuration}>3:23</Text>
        </TouchableOpacity>
      </View>

      {/* Stage Profile & Starting Instrument */}
      <View style={styles.glassSection}>
        <Text style={styles.sectionHeading}>STAGE PROFILE & INSTRUMENT</Text>

        <TextInput
          style={styles.nameInputField}
          placeholder="Stage Name (e.g. Karthik, Hendrix, Lars)"
          placeholderTextColor={theme.colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.instrumentScroll}>
          <View style={styles.instrumentRow}>
            {INSTRUMENT_CAROUSEL.map(item => {
              const isSelected = selectedInstrument === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.instrumentCard,
                    isSelected ? { borderColor: item.color, backgroundColor: item.gradient } : null,
                  ]}
                  onPress={() => setSelectedInstrument(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.instrumentIconBox, { backgroundColor: item.color }]}>
                    <Text style={styles.instrumentIconText}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.instrumentName, isSelected ? { color: item.color } : null]}>
                    {item.label}
                  </Text>
                  <Text style={styles.instrumentSubText}>{item.sub}</Text>
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: item.color }]}>
                      <Text style={styles.selectedIndicatorText}>ACTIVE</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Action Deck (Create vs Join Band) */}
      <View style={styles.actionRow}>
        {/* Create Band Room */}
        <View style={[styles.actionColumn, { marginRight: 6 }]}>
          <Text style={styles.actionColumnTitle}>HOST BAND</Text>
          <Text style={styles.actionColumnDesc}>Leader mode with sync & QR</Text>
          <TouchableOpacity style={styles.createRoomButton} onPress={handleCreateRoom} activeOpacity={0.85}>
            <Text style={styles.createRoomButtonText}>+ CREATE ROOM</Text>
          </TouchableOpacity>
        </View>

        {/* Join Band Room */}
        <View style={[styles.actionColumn, { marginLeft: 6 }]}>
          <Text style={styles.actionColumnTitle}>JOIN BAND</Text>
          <TextInput
            style={styles.roomCodeField}
            placeholder="6-CODE"
            placeholderTextColor={theme.colors.textMuted}
            value={roomCode}
            onChangeText={t => setRoomCode(t.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.joinRoomButton} onPress={handleJoinRoom} activeOpacity={0.85}>
            <Text style={styles.joinRoomButtonText}>JOIN ROOM</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Spacing for bottom dock */}
      <View style={{ height: 90 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#06070B',
    minHeight: '100%',
  },

  // Top Header matching Dribbble screenshot
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 6,
  },
  headerSub: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  avatarIcon: {
    fontSize: 20,
  },
  avatarOnlineDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#06070B',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: '#A855F7',
  },
  settingsIcon: {
    fontSize: 18,
  },

  // Central Luminous Sound Orb (Identifying Songs Hero Element)
  orbHeroWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    position: 'relative',
  },
  orbTouchContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbAmbientAura: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    filter: 'blur(35px)',
  },
  orbSecondaryAura: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    filter: 'blur(25px)',
  },
  orbOuterRing: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 3,
    borderColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 45px rgba(168, 85, 247, 0.6), inset 0 0 25px rgba(37, 99, 235, 0.4)',
    backgroundColor: '#070914',
    position: 'relative',
  },
  orbOuterRingActive: {
    borderColor: '#00E5FF',
    boxShadow: '0 0 65px rgba(0, 229, 255, 0.8), inset 0 0 35px rgba(168, 85, 247, 0.6)',
    transform: [{ scale: 1.05 }],
  },
  orbGradientBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 105,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    borderTopColor: '#C084FC',
    borderRightColor: '#3B82F6',
    borderBottomColor: '#10B981',
  },
  orbMiddleRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#080A16',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInnerCore: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#0A0D1E',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
  },
  orbCoreIcon: {
    fontSize: 42,
    color: '#FFFFFF',
  },

  listeningTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 30, 52, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 18,
    marginBottom: 16,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 8,
    boxShadow: '0 0 8px #10B981',
  },
  listeningTagText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // APK Download Card for Vercel & Mobile
  downloadApkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 20, 36, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
  },
  downloadApkBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  downloadApkBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
  },
  downloadApkInfo: {
    flex: 1,
  },
  downloadApkTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  downloadApkSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  downloadApkAction: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  downloadApkActionText: {
    color: '#06070B',
    fontSize: 11,
    fontWeight: '900',
  },

  // My Music / Live Sessions Section (Matching Dribbble bottom card)
  myMusicSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  myMusicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  myMusicTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  viewAllText: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '800',
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 20, 36, 0.75)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  trackArtwork: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trackArtworkIcon: {
    fontSize: 22,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  trackArtist: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  trackDuration: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },

  // Glass Section for Stage Profile & Carousel
  glassSection: {
    backgroundColor: 'rgba(16, 20, 36, 0.75)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeading: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  nameInputField: {
    backgroundColor: 'rgba(24, 29, 48, 0.6)',
    color: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  instrumentScroll: {
    flexDirection: 'row',
  },
  instrumentRow: {
    flexDirection: 'row',
  },
  instrumentCard: {
    width: 115,
    padding: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(24, 29, 48, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  instrumentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  instrumentIconText: {
    fontSize: 20,
  },
  instrumentName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  instrumentSubText: {
    color: '#94A3B8',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedIndicator: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },

  // Action Row (Host vs Join)
  actionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionColumn: {
    flex: 1,
    backgroundColor: 'rgba(16, 20, 36, 0.75)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
  },
  actionColumnTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  actionColumnDesc: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
    marginBottom: 10,
  },
  createRoomButton: {
    backgroundColor: '#A855F7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
  },
  createRoomButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  roomCodeField: {
    backgroundColor: 'rgba(24, 29, 48, 0.6)',
    color: '#00E5FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
    letterSpacing: 2,
  },
  joinRoomButton: {
    backgroundColor: '#00E5FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinRoomButtonText: {
    color: '#06070B',
    fontSize: 11,
    fontWeight: '900',
  },

  // Notifications & Server Drawer
  errorBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#F43F5E',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  errorText: {
    color: '#F43F5E',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 12,
  },
  errorSubText: {
    color: '#FDA4AF',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  toastBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  toastText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 11,
    textAlign: 'center',
  },
  serverConfigBox: {
    backgroundColor: 'rgba(16, 20, 36, 0.95)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  serverConfigTitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  serverConfigDesc: {
    color: '#94A3B8',
    fontSize: 10,
    marginBottom: 8,
  },
  presetIpRow: {
    marginBottom: 8,
  },
  presetIpBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  presetIpBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  presetIpBtnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetIpBtnTextSecondary: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  serverIpRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  serverIpInput: {
    flex: 1,
    backgroundColor: 'rgba(24, 29, 48, 0.8)',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  saveIpBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
  },
  saveIpBtnText: {
    color: '#06070B',
    fontWeight: '900',
    fontSize: 11,
  },
});
