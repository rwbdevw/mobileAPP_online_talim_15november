import React from 'react';
import { View, Text, StyleSheet, Button, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/auth';
import { API_BASE_URL } from '../config/constants';
import { useNavigation } from '@react-navigation/native';

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigation = useNavigation<any>();

  const resolveImageUrl = (pi?: string | null) => {
    if (!pi) return undefined;
    if (/^https?:\/\//i.test(pi)) return pi;
    if (pi.startsWith('/uploads/')) return `${API_BASE_URL}${pi}`;
    if (pi.startsWith('uploads/')) return `${API_BASE_URL}/${pi}`;
    return `${API_BASE_URL}/uploads/${pi}`;
  };

  const roleBadge = (role?: string) => {
    if (role === 'admin') return { text: 'Administrator', bg: '#fee2e2', color: '#b91c1c' };
    if (role === 'instructor') return { text: "O'qituvchi", bg: '#dbeafe', color: '#1d4ed8' };
    return { text: 'Talaba', bg: '#dcfce7', color: '#166534' };
  };

  const badge = roleBadge(user?.role);
  const join = user?.created_at ? new Date(user.created_at) : undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          {resolveImageUrl(user?.profile_image) ? (
            <Image source={{ uri: resolveImageUrl(user?.profile_image) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>{(user?.username ?? 'U')[0].toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.username ?? 'Noma’lum'}</Text>
          {!!user?.email && <Text style={styles.email}>{user.email}</Text>}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
            </View>
            {!!join && (
              <Text style={styles.joined}>• {join.toLocaleDateString()}</Text>
            )}
          </View>
        </View>
      </View>

      {!!user?.bio && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bio</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('EditProfile') }>
          <Text style={styles.primaryText}>Profilni tahrirlash</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerBtn} onPress={logout}>
          <Text style={styles.primaryText}>Chiqish</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', marginRight: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  name: { fontSize: 20, fontWeight: '700' },
  email: { color: '#64748b', marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, marginRight: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  joined: { color: '#64748b' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  bio: { color: '#374151' },
  actions: { marginTop: 8, gap: 10 },
  primaryBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  dangerBtn: { backgroundColor: '#ef4444', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
});
