import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  lastGesture: string;
}

export const MotionVisualizer: React.FC<Props> = ({ x, y, z, magnitude, lastGesture }) => {
  const normX = Math.min(100, Math.abs(x) * 5);
  const normY = Math.min(100, Math.abs(y) * 5);
  const normZ = Math.min(100, Math.abs(z) * 5);
  const normMag = Math.min(100, magnitude * 3);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI MOTION GESTURE SENSOR</Text>

      <View style={styles.meterContainer}>
        <View style={styles.meterRow}>
          <Text style={styles.axisLabel}>X (Shake)</Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${normX}%`, backgroundColor: '#33FFF5' }]} />
          </View>
        </View>

        <View style={styles.meterRow}>
          <Text style={styles.axisLabel}>Y (Tilt)</Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${normY}%`, backgroundColor: '#FF33A8' }]} />
          </View>
        </View>

        <View style={styles.meterRow}>
          <Text style={styles.axisLabel}>Z (Strike)</Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${normZ}%`, backgroundColor: '#FFC300' }]} />
          </View>
        </View>

        <View style={styles.meterRow}>
          <Text style={styles.axisLabel}>3D Vector</Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${normMag}%`, backgroundColor: '#00E676' }]} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.gestureText}>
          GESTURE: <Text style={styles.gestureHighlight}>{lastGesture.toUpperCase() || 'READY'}</Text>
        </Text>
        <Text style={styles.hintText}>Shake phone for Hi-Hat • Downward strike for Kick/Snare</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E2E',
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#313244',
  },
  title: {
    color: '#89B4FA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  meterContainer: {
    marginVertical: 4,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  axisLabel: {
    color: '#A6ADC8',
    fontSize: 11,
    width: 75,
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: '#313244',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    marginTop: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#313244',
    paddingTop: 8,
  },
  gestureText: {
    color: '#CDD6F4',
    fontWeight: '700',
    fontSize: 12,
  },
  gestureHighlight: {
    color: '#00E676',
    fontWeight: '900',
  },
  hintText: {
    color: '#A6ADC8',
    fontSize: 10,
    marginTop: 2,
  },
});
