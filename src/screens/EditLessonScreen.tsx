import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { updateInstructorLesson, instructorUploadFile } from '../api/mobile';
import * as DocumentPicker from 'expo-document-picker';

export function EditLessonScreen() {
  const route = useRoute<any>();
  const { lessonId, title: initialTitle, video_url: initialUrl, order: initialOrder } = route.params as { lessonId: number; title?: string; video_url?: string; order?: number };
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState(initialTitle || '');
  const [videoUrl, setVideoUrl] = useState(initialUrl || '');
  const [order, setOrder] = useState(String(initialOrder ?? ''));
  const [saving, setSaving] = useState(false);
  const urlWarning = React.useMemo(() => {
    const u = (videoUrl || '').trim();
    if (!u) return null;
    const isHttp = /^https?:\/\//i.test(u);
    const endsVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u);
    if (isHttp && !endsVideo) return 'HTTPS havola .mp4/.webm/.mov/.m4v bilan tugashi tavsiya etiladi';
    if (!isHttp) {
      const startsUploads = u.startsWith('/uploads/') || u.startsWith('uploads/');
      const bareFilename = !u.includes('/') && endsVideo;
      if (!(startsUploads || bareFilename)) return "Nisbiy yo'l /uploads/... yoki oddiy fayl nomi (.mp4/.webm/.mov/.m4v) bo'lishi kerak";
    }
    return null;
  }, [videoUrl]);

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Xatolik', 'Dars sarlavhasi talab qilinadi');
      return;
    }
    if (urlWarning) {
      Alert.alert('Ogohlantirish', urlWarning);
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

  const pickAndUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'video/*', multiple: false, copyToCacheDirectory: true });
      if ((res as any).canceled) return;
      const asset = (res as any).assets?.[0];
      if (!asset) return;
      const name = asset.name || (asset.uri?.split('/')?.pop()) || `video_${Date.now()}.mp4`;
      const type = asset.mimeType || 'video/mp4';
      setSaving(true);
      const out = await instructorUploadFile({ uri: asset.uri, name, type });
      if (!out?.success || !out?.url) {
        Alert.alert('Xatolik', out?.message || 'Yuklashda xatolik');
        return;
      }
      setVideoUrl(out.filename || out.url.replace('/uploads/', ''));
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? 'Yuklashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Darsni tahrirlash</Text>
      <TextInput placeholder="Sarlavha" placeholderTextColor="#94A3B8" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Video URL" placeholderTextColor="#94A3B8" style={styles.input} value={videoUrl} onChangeText={setVideoUrl} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Button title={saving ? 'Yuklanmoqda...' : 'Videoni yuklash'} onPress={pickAndUpload} disabled={saving} />
      </View>
      {!!urlWarning && <Text style={styles.hint}>{urlWarning}</Text>}
      <TextInput placeholder="Tartib" placeholderTextColor="#94A3B8" style={styles.input} value={order} keyboardType="numeric" onChangeText={setOrder} />
      <Button title={saving ? 'Kutilmoqda...' : 'Saqlash'} onPress={onSave} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12 },
  hint: { color: '#ef4444', marginTop: -6, marginBottom: 10 },
});
