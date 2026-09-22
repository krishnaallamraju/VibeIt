import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export type TabType = 'home' | 'stage' | 'ai' | 'sessions';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  roomCode?: string;
  currentInstrument?: string;
}

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'stage', label: 'Stage', icon: '🎸' },
  { id: 'ai', label: 'AI Studio', icon: '🤖' },
  { id: 'sessions', label: 'Sessions', icon: '🎙' },
];

export const BottomDock: React.FC<Props> = ({
  activeTab,
  onTabChange,
  roomCode,
  currentInstrument,
}) => {
  return (
    <View style={styles.dockContainer}>
      <View style={styles.dockGlass}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.dockItem, isActive ? styles.dockItemActive : null]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.dockIcon}>{tab.icon}</Text>
              <Text style={[styles.dockLabel, isActive ? styles.dockLabelActive : null]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 999,
  },
  dockGlass: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 22, 34, 0.88)',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'space-around',
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    position: 'relative',
  },
  dockItemActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
  },
  dockIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  dockLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  dockLabelActive: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 2,
  },
});
