import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { addInstructorLesson, instructorUploadFile } from '../api/mobile';
import * as DocumentPicker from 'expo-document-picker';
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

  const urlWarning = React.useMemo(() => {
    const u = (videoUrl || '').trim();
    if (!u) return null;
    const isHttp = /^https?:\/\//i.test(u);
    const endsVideo = /\.(mp4|webm)(\?|#|$)/i.test(u);
    if (isHttp && !endsVideo) return 'HTTPS havola .mp4 yoki .webm bilan tugashi tavsiya etiladi';
    if (!isHttp) {
      const startsUploads = u.startsWith('/uploads/') || u.startsWith('uploads/');
      if (!startsUploads || !endsVideo) return "Nisbiy yo'l /uploads/... va .mp4/.webm bo'lishi kerak";
    }
    return null;
  }, [videoUrl]);

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Xatolik', 'Dars sarlavhasi talab qilinadi');
      return;
    }
    if (urlWarning) {
      Alert.alert('Ogohlantirish', urlWarning);
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

  const pickAndUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'video/*', multiple: false, copyToCacheDirectory: true });
      if ((res as any).canceled) return;
      const asset = (res as any).assets?.[0];
      if (!asset) return;
      const name = asset.name || (asset.uri?.split('/')?.pop()) || `video_${Date.now()}.mp4`;
      const type = asset.mimeType || 'video/mp4';
      setLoading(true);
      const out = await instructorUploadFile({ uri: asset.uri, name, type });
      if (!out?.success || !out?.url) {
        Alert.alert('Xatolik', out?.message || 'Yuklashda xatolik');
        return;
      }
      setVideoUrl(out.url);
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? 'Yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{"Dars qo'shish"}</Text>
      <TextInput placeholder="Sarlavha" placeholderTextColor="#94A3B8" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Video URL (nisbiy yoki to'liq)" placeholderTextColor="#94A3B8" style={styles.input} value={videoUrl} onChangeText={setVideoUrl} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Button title={loading ? 'Yuklanmoqda...' : 'Videoni yuklash'} onPress={pickAndUpload} disabled={loading} />
      </View>
      {!!urlWarning && <Text style={styles.hint}>{urlWarning}</Text>}
      <TextInput placeholder="Tartib (1,2,3...)" placeholderTextColor="#94A3B8" style={styles.input} keyboardType="numeric" value={order} onChangeText={setOrder} />
      <Button title={loading ? 'Kutilmoqda...' : 'Saqlash'} onPress={onSubmit} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12 },
  hint: { color: '#ef4444', marginTop: -6, marginBottom: 10 },
});
