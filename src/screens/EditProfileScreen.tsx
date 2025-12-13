import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from '../store/auth';
import { API_BASE_URL } from '../config/constants';
import { fetchMe, updateProfile, uploadProfileImage } from '../api/mobile';

export function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resolveImageUrl = (pi?: string | null) => {
    if (!pi) return undefined;
    if (/^https?:\/\//i.test(pi)) return pi;
    if (pi.startsWith('/uploads/')) return `${API_BASE_URL}${pi}`;
    if (pi.startsWith('uploads/')) return `${API_BASE_URL}/${pi}`;
    return `${API_BASE_URL}/uploads/${pi}`;
  };

  const onPickImage = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'image/*', multiple: false, copyToCacheDirectory: true });
      if ((res as any).canceled) return;
      const asset = (res as any).assets?.[0];
      if (!asset) return;
      const name = asset.name || (asset.uri?.split('/')?.pop()) || `avatar_${Date.now()}.jpg`;
      const type = asset.mimeType || 'image/jpeg';
      setUploading(true);
      const out = await uploadProfileImage({ uri: asset.uri, name, type });
      if (!out?.success || (!out?.url && !out?.filename)) {
        Alert.alert('Xatolik', out?.message || 'Yuklashda xatolik');
        return;
      }
      const filename = out.filename || (out.url || '').replace('/uploads/', '');
      useAuthStore.setState({ user: { ...user!, profile_image: filename } });
      Alert.alert('Muvaffaqiyatli', 'Profil rasmi yangilandi');
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? 'Yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    try {
      if (!username.trim() || !email.trim()) {
        Alert.alert('Xatolik', 'Username va email talab qilinadi');
        return;
      }
      if ((newPassword || confirmPassword) && !currentPassword) {
        Alert.alert('Xatolik', 'Parolni o\'zgartirish uchun joriy parolni kiriting');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Xatolik', 'Yangi parol va tasdiq mos kelmaydi');
        return;
      }
      setSaving(true);
      await updateProfile({
        username: username.trim(),
        email: email.trim(),
        bio: bio,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
        confirm_password: confirmPassword || undefined,
      } as any);
      const r = await fetchMe();
      if (r?.user) useAuthStore.setState({ user: r.user });
      Alert.alert('Muvaffaqiyatli', 'Profil yangilandi');
    } catch (e: any) {
      Alert.alert('Xatolik', e?.response?.data?.message || e?.message || 'Saqlanmadi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profilni tahrirlash</Text>

      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          {resolveImageUrl(user?.profile_image) ? (
            <Image source={{ uri: resolveImageUrl(user?.profile_image) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>{(user?.username ?? 'U')[0].toUpperCase()}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#2563eb' }]} onPress={onPickImage} disabled={uploading}>
          <Text style={styles.btnText}>{uploading ? 'Yuklanmoqda...' : 'Rasmni yangilash'}</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Foydalanuvchi nomi" placeholderTextColor="#94A3B8" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#94A3B8" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={[styles.input, { height: 100 }]} multiline placeholder="Bio" placeholderTextColor="#94A3B8" value={bio} onChangeText={setBio} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Parolni o'zgartirish (ixtiyoriy)</Text>
        <TextInput style={styles.input} placeholder="Joriy parol" placeholderTextColor="#94A3B8" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
        <TextInput style={styles.input} placeholder="Yangi parol" placeholderTextColor="#94A3B8" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        <TextInput style={styles.input} placeholder="Parolni tasdiqlash" placeholderTextColor="#94A3B8" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#16a34a' }]} onPress={onSave} disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', marginRight: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  btn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
