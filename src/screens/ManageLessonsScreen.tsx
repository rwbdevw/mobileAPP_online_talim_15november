import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCourseDetail, deleteInstructorLesson, instructorCreateQuiz } from '../api/mobile';

export function ManageLessonsScreen() {
  const route = useRoute<any>();
  const { courseId, title } = route.params as { courseId: number; title?: string };
  const navigation = useNavigation<any>();
  const qc = useQueryClient();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['instructor-course-detail', courseId],
    queryFn: () => fetchCourseDetail(courseId),
  });

  useFocusEffect(React.useCallback(() => {
    refetch();
  }, [courseId]));

  const onDelete = async (lessonId: number) => {
    Alert.alert("O'chirish", "Rostdan ham o'chirasizmi?", [
      { text: 'Bekor qilish' },
      {
        text: "O'chirish",
        style: 'destructive',
        onPress: async () => {
          await deleteInstructorLesson(lessonId);
          await refetch();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title ?? 'Darslar'}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => (navigation as any)?.navigate('AddLesson', { courseId, title })}>
          <Text style={styles.primaryBtnText}>Dars qo'shish</Text>
        </TouchableOpacity>
      </View>
      {(isRefetching) && <ActivityIndicator style={{ marginVertical: 8 }} />}
      <FlatList
        data={data?.lessons ?? []}
        keyExtractor={(l) => String(l.id)}
        renderItem={({ item }) => (
          <View style={styles.lessonRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>{item.order}. {item.title}</Text>
              {!!item.video_url && <Text style={styles.lessonMeta} numberOfLines={1}>{item.video_url}</Text>}
            </View>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => (navigation as any)?.navigate('EditLesson', { lessonId: item.id, title: item.title, video_url: item.video_url, order: item.order })}>
              <Text style={styles.outlineBtnText}>Tahrirlash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: '#10b981' }]}
              onPress={async () => {
                try {
                  const r = await instructorCreateQuiz(item.id);
                  if (!r?.success) {
                    Alert.alert('Xatolik', r?.error || 'Test yaratilmadi');
                    return;
                  }
                  Alert.alert('Muvaffaqiyatli', `Test yaratildi (ID: ${r.quiz_id})${r.created_sample ? ' — namunaviy savollar bilan' : ''}`);
                } catch (e: any) {
                  Alert.alert('Xatolik', e?.message ?? 'Xatolik yuz berdi');
                } finally {
                  await refetch();
                }
              }}
            >
              <Text style={[styles.outlineBtnText, { color: '#10b981' }]}>Test qo'shish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.outlineBtn, { borderColor: '#ef4444' }]} onPress={() => onDelete(item.id)}>
              <Text style={[styles.outlineBtnText, { color: '#ef4444' }]}>O'chirish</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>Hali darslar yo'q</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#1d4ed8', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  lessonRow: { flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12, marginBottom: 10 },
  lessonTitle: { fontWeight: '700' },
  lessonMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  outlineBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1d4ed8' },
  outlineBtnText: { color: '#1d4ed8', fontWeight: '700' },
});
