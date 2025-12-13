import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { fetchCourseDetail } from '../api/mobile';
import { updateInstructorCourse } from '../api/mobile';
import { useQueryClient } from '@tanstack/react-query';

export function EditCourseScreen() {
  const route = useRoute<any>();
  const { courseId } = route.params as { courseId: number; title?: string };
  const navigation = useNavigation<any>();
  const qc = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const d = await fetchCourseDetail(courseId);
        setTitle(d.title || '');
        setDescription(d.description || '');
        setPrice(String(d.price ?? ''));
        setCategory(d.category || '');
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const onSave = async () => {
    try {
      setSaving(true);
      await updateInstructorCourse(courseId, {
        title: title.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        category: category.trim(),
      });
      await qc.invalidateQueries({ queryKey: ['instructor-courses'] });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kursni tahrirlash</Text>
      <TextInput placeholder="Sarlavha" placeholderTextColor="#94A3B8" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Tavsif" placeholderTextColor="#94A3B8" style={[styles.input, { height: 100 }]} multiline value={description} onChangeText={setDescription} />
      <TextInput placeholder="Narx" placeholderTextColor="#94A3B8" style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
      <TextInput placeholder="Kategoriya" placeholderTextColor="#94A3B8" style={styles.input} value={category} onChangeText={setCategory} />
      <Button title={saving ? 'Kutilmoqda...' : 'Saqlash'} onPress={onSave} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12 },
});
