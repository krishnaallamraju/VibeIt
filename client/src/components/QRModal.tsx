import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { QRCodeSVG } from 'qrcode.react';
import { socketClient } from '../network/SocketClient';

interface Props {
  visible: boolean;
  roomCode: string;
  onClose: () => void;
}

export const QRModal: React.FC<Props> = ({ visible, roomCode, onClose }) => {
  const serverUrl = socketClient.getServerUrl();
  const joinUrl = `${serverUrl}/?room=${roomCode}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>JOIN VIBEIT ROOM</Text>
          <Text style={styles.subtitle}>Scan QR code with smartphone camera to join band</Text>

          <View style={styles.qrContainer}>
            <QRCodeSVG value={joinUrl} size={180} bgColor="#1E1E2E" fgColor="#00E676" level="H" />
          </View>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>ROOM CODE:</Text>
            <Text style={styles.codeText}>{roomCode}</Text>
            <Text style={styles.urlText}>{joinUrl}</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E2E',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1.5,
    borderColor: '#00E676',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#A6ADC8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: '#1E1E2E',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#313244',
  },
  codeBox: {
    alignItems: 'center',
    marginVertical: 14,
  },
  codeLabel: {
    color: '#A6ADC8',
    fontSize: 10,
    fontWeight: '700',
  },
  codeText: {
    color: '#00E5FF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 4,
  },
  urlText: {
    color: '#A6ADC8',
    fontSize: 10,
    marginTop: 4,
  },
  closeBtn: {
    backgroundColor: '#00E676',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  },
});
