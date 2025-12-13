import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../api/client';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const onSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Xatolik', 'Login va parolni kiriting');
      return;
    }
    try {
      setLoading(true);
      await login(username.trim(), password);
      // AppNavigator accessToken orqali Tabsga o‘tadi
    } catch (e: any) {
      Alert.alert('Kirishda xatolik', e?.message ?? 'Iltimos qayta urinib ko‘ring');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kirish</Text>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Parol"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? 'Kutilmoqda...' : 'Kirish'} onPress={onSubmit} disabled={loading} />
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{ color: '#1d4ed8', textAlign: 'center' }}>{"Ro'yxatdan o'tish"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
});
