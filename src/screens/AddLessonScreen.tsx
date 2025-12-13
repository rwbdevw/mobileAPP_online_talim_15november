import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { addInstructorLesson } from '../api/mobile';
import { useQueryClient } from '@tanstack/react-query';

export function AddLessonScreen() {
  const route = useRoute<any>();
  const { courseId } = route.params as { courseId: number; title?: string };
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [order, setOrder] = useState('1');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const qc = useQueryClient();

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Xatolik', 'Dars sarlavhasi talab qilinadi');
      return;
    }
    try {
      setLoading(true);
      await addInstructorLesson(courseId, { title: title.trim(), video_url: videoUrl.trim(), order: Number(order) || 1 });
      await qc.invalidateQueries({ queryKey: ['instructor-courses'] });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? "Dars qo'shilmadi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{"Dars qo'shish"}</Text>
      <TextInput placeholder="Sarlavha" placeholderTextColor="#94A3B8" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Video URL (nisbiy yoki to'liq)" placeholderTextColor="#94A3B8" style={styles.input} value={videoUrl} onChangeText={setVideoUrl} />
      <TextInput placeholder="Tartib (1,2,3...)" placeholderTextColor="#94A3B8" style={styles.input} keyboardType="numeric" value={order} onChangeText={setOrder} />
      <Button title={loading ? 'Kutilmoqda...' : 'Saqlash'} onPress={onSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12 },
});
