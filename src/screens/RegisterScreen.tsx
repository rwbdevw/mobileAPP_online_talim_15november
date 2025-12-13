import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { register } from '../api/client';

export function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!username || !email || !password) {
      Alert.alert('Xatolik', "Maydonlarni to'ldiring");
      return;
    }
    try {
      setLoading(true);
      await register(username.trim(), email.trim(), password, role);
      // access/refresh token saqlanadi va AppNavigator avtomatik Tabsga o'tadi
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{"Ro'yxatdan o'tish"}</Text>
      <TextInput placeholder="Username" placeholderTextColor="#94A3B8" style={styles.input} autoCapitalize="none" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Email" placeholderTextColor="#94A3B8" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Parol" placeholderTextColor="#94A3B8" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <View style={styles.roleRow}>
        <TouchableOpacity onPress={() => setRole('student')} style={[styles.roleOption, role === 'student' && styles.roleOptionActive]}>
          <Text style={[styles.roleOptionText, role === 'student' && styles.roleOptionTextActive]}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('instructor')} style={[styles.roleOption, role === 'instructor' && styles.roleOptionActive]}>
          <Text style={[styles.roleOptionText, role === 'instructor' && styles.roleOptionTextActive]}>Instructor</Text>
        </TouchableOpacity>
      </View>
      <Button title={loading ? 'Kutilmoqda...' : "Ro'yxatdan o'tish"} onPress={onSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  roleOption: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  roleOptionActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  roleOptionText: { color: '#111827', fontWeight: '600' },
  roleOptionTextActive: { color: '#fff' },
});
