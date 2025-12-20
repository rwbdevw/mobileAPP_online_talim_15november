import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCourseDetail, enrollCourse, fetchCourseProgress } from '../api/mobile';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { colors } from '../theme';

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
      <Card style={{ marginBottom: 12 }}>
        <Text style={styles.title}>{data.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          {!!data.category && <Text style={styles.chip}>{data.category}</Text>}
          {!!data.instructor && <Text style={[styles.meta, { marginLeft: 8 }]}>O'qituvchi: {data.instructor.username}</Text>}
        </View>
        {!!data.description && <Text style={styles.desc}>{data.description}</Text>}
        <Text style={[styles.meta, { marginTop: 4 }]}>Narx: {data.price ?? 0}</Text>
        {typeof progressData?.enrollment_progress === 'number' && (
          <View style={{ marginTop: 10 }}>
            <ProgressBar value={progressData?.enrollment_progress ?? 0} />
            <Text style={[styles.meta, { marginTop: 4 }]}>Progress: {Math.round(progressData?.enrollment_progress ?? 0)}%</Text>
          </View>
        )}
        <View style={{ marginTop: 12 }}>
          <Button title="Kursga yozilish" onPress={onEnroll} />
        </View>
      </Card>

      <Text style={[styles.title, { marginBottom: 8 }]}>Darslar</Text>
      <FlatList
        data={data.lessons}
        keyExtractor={(l) => String(l.id)}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('LessonPlayer', { title: item.title, videoUrl: item.video_url, lessonId: item.id, courseId })}>
            <Text style={{ fontWeight: '600', color: colors.text }}>{item.order}. {item.title} {completed.has(item.id) ? '✓' : ''}</Text>
          </Card>
        )}
        ListEmptyComponent={<Text>Hali darslar yoʻq</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: colors.text },
  chip: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', color: '#1d4ed8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  desc: { color: '#555', marginBottom: 6 },
  meta: { color: '#444' },
});
