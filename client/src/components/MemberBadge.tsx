import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Member } from '../types';
import { theme } from '../styles/theme';

interface Props {
  member: Member;
  isSelf?: boolean;
}

const INSTRUMENT_AVATARS: Record<string, { icon: string; bg: string }> = {
  drums: { icon: '🥁', bg: '#FF2A75' },
  keyboard: { icon: '🎹', bg: '#7C3AED' },
  bass: { icon: '🎸', bg: '#00E5FF' },
  vocals: { icon: '🎤', bg: '#FFC107' },
  bandmate: { icon: '🤖', bg: '#00E676' },
};

export const MemberBadge: React.FC<Props> = ({ member, isSelf }) => {
  const avatar = INSTRUMENT_AVATARS[member.instrument] || { icon: '🎵', bg: '#7C3AED' };

  const getPingColor = (ping: number) => {
    if (ping <= 40) return '#00E676';
    if (ping <= 100) return '#FFC107';
    return '#FF2A75';
  };

  return (
    <View style={[styles.card, isSelf ? styles.selfCard : null]}>
      <View style={styles.leftSection}>
        <View style={[styles.avatarBox, { backgroundColor: avatar.bg }]}>
          <Text style={styles.avatarIcon}>{avatar.icon}</Text>
          <View style={[styles.onlineDot, { backgroundColor: getPingColor(member.ping) }]} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {member.name}
            </Text>
            {isSelf && <Text style={styles.youBadge}>YOU</Text>}
          </View>
          <Text style={styles.instrumentText}>{member.instrument.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {member.isHost && (
          <View style={styles.leaderPill}>
            <Text style={styles.leaderText}>LEADER</Text>
          </View>
        )}
        <View style={styles.pingRow}>
          <Text style={[styles.pingValue, { color: getPingColor(member.ping) }]}>
            {member.ping ? `${member.ping}ms` : 'Syncing'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selfCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#1A1730',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  avatarIcon: {
    fontSize: 22,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.cardBg,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  youBadge: {
    backgroundColor: theme.colors.primary,
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  instrumentText: {
    color: theme.colors.secondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  leaderPill: {
    backgroundColor: 'rgba(255, 42, 117, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.pink,
    marginBottom: 4,
  },
  leaderText: {
    color: theme.colors.pink,
    fontSize: 9,
    fontWeight: '800',
  },
  pingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pingValue: {
    fontSize: 10,
    fontWeight: '700',
  },
});
