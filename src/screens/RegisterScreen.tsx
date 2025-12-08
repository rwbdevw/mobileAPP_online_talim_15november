import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

export function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!username || !email || !password) {
      Alert.alert('Xatolik', "Maydonlarni to'ldiring");
      return;
    }
    try {
      setLoading(true);
      // TODO: Backend tayyor bo'lgach mobil register endpointga bog'lash
      Alert.alert('Muvaffaqiyat', "Ro'yxatdan o'tish yakunlandi (demo)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{"Ro'yxatdan o'tish"}</Text>
      <TextInput placeholder="Username" style={styles.input} autoCapitalize="none" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Parol" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <Button title={loading ? 'Kutilmoqda...' : "Ro'yxatdan o'tish"} onPress={onSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
});
