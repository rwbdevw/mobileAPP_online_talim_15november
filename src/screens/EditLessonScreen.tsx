import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { updateInstructorLesson } from '../api/mobile';

export function EditLessonScreen() {
  const route = useRoute<any>();
  const { lessonId, title: initialTitle, video_url: initialUrl, order: initialOrder } = route.params as { lessonId: number; title?: string; video_url?: string; order?: number };
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState(initialTitle || '');
  const [videoUrl, setVideoUrl] = useState(initialUrl || '');
  const [order, setOrder] = useState(String(initialOrder ?? ''));
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Xatolik', 'Dars sarlavhasi talab qilinadi');
      return;
    }
    try {
      setSaving(true);
      await updateInstructorLesson(lessonId, { title: title.trim(), video_url: videoUrl.trim(), order: Number(order) || 1 });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? 'Saqlanmadi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Darsni tahrirlash</Text>
      <TextInput placeholder="Sarlavha" placeholderTextColor="#94A3B8" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Video URL" placeholderTextColor="#94A3B8" style={styles.input} value={videoUrl} onChangeText={setVideoUrl} />
      <TextInput placeholder="Tartib" placeholderTextColor="#94A3B8" style={styles.input} value={order} keyboardType="numeric" onChangeText={setOrder} />
      <Button title={saving ? 'Kutilmoqda...' : 'Saqlash'} onPress={onSave} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12 },
});
