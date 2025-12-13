import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { createInstructorCourse } from '../api/mobile';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

export function NewCourseScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const qc = useQueryClient();

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Xatolik', 'Sarlavha talab qilinadi');
      return;
    }
    try {
      setLoading(true);
      await createInstructorCourse({ title: title.trim(), description: description.trim(), price: Number(price) || 0, category: category.trim() });
      await qc.invalidateQueries({ queryKey: ['instructor-courses'] });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? 'Kurs yaratilmadi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yangi kurs</Text>
      <TextInput placeholder="Sarlavha" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Tavsif" style={[styles.input, { height: 100 }]} multiline value={description} onChangeText={setDescription} />
      <TextInput placeholder="Narx" style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
      <TextInput placeholder="Kategoriya" style={styles.input} value={category} onChangeText={setCategory} />
      <Button title={loading ? 'Kutilmoqda...' : 'Saqlash'} onPress={onSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12 },
});
