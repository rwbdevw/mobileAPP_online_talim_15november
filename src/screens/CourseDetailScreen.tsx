import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCourseDetail, enrollCourse, fetchCourseProgress } from '../api/mobile';

export function CourseDetailScreen() {
  const route = useRoute<any>();
  const { courseId } = route.params as { courseId: number; title?: string };
  const navigation = useNavigation<any>();
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: () => fetchCourseDetail(courseId),
  });

  const { data: progressData } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => fetchCourseProgress(courseId),
  });

  const completed = React.useMemo(() => {
    const set = new Set<number>();
    if (progressData?.lessons) {
      for (const l of progressData.lessons) if (l.completed) set.add(l.lesson_id);
    }
    return set;
  }, [progressData]);

  const onEnroll = async () => {
    try {
      await enrollCourse(courseId);
      Alert.alert('Muvaffaqiyatli', 'Kursga yozildingiz.');
      await qc.invalidateQueries({ queryKey: ['my-courses'] });
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? 'Enroll amalga oshmadi');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Maʼlumot topilmadi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
      {!!data.category && <Text style={styles.chip}>{data.category}</Text>}
      {!!data.instructor && <Text style={styles.meta}>O'qituvchi: {data.instructor.username}</Text>}
      <Text style={styles.desc}>{data.description}</Text>
      <Text style={styles.meta}>Narx: {data.price ?? 0}</Text>
      {typeof progressData?.enrollment_progress === 'number' && (
        <View style={{ marginTop: 10 }}>
          <View style={styles.progressWrap}>
            <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, Math.round(progressData?.enrollment_progress ?? 0)))}%` }]} />
          </View>
          <Text style={[styles.meta, { marginTop: 4 }]}>Progress: {Math.round(progressData?.enrollment_progress ?? 0)}%</Text>
        </View>
      )}
      <TouchableOpacity style={styles.enroll} onPress={onEnroll}>
        <Text style={styles.enrollText}>Enroll</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: 16 }]}>Darslar</Text>
      <FlatList
        data={data.lessons}
        keyExtractor={(l) => String(l.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.lesson}
            onPress={() => navigation.navigate('LessonPlayer', { title: item.title, videoUrl: item.video_url, lessonId: item.id, courseId })}
          >
            <Text style={{ fontWeight: '600' }}>{item.order}. {item.title} {completed.has(item.id) ? '✓' : ''}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Hali darslar yoʻq</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  chip: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', color: '#1d4ed8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginBottom: 6 },
  desc: { color: '#555', marginBottom: 6 },
  meta: { color: '#444' },
  enroll: { alignSelf: 'flex-start', backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  enrollText: { color: 'white', fontWeight: '700' },
  lesson: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  progressWrap: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#2563eb' },
});
