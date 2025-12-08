import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchCourseDetail, enrollCourse } from '../api/mobile';

export function CourseDetailScreen() {
  const route = useRoute<any>();
  const { courseId } = route.params as { courseId: number; title?: string };

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: () => fetchCourseDetail(courseId),
  });

  const onEnroll = async () => {
    try {
      await enrollCourse(courseId);
      Alert.alert('Muvaffaqiyatli', 'Kursga yozildingiz.');
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
      <TouchableOpacity style={styles.enroll} onPress={onEnroll}>
        <Text style={styles.enrollText}>Enroll</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: 16 }]}>Darslar</Text>
      <FlatList
        data={data.lessons}
        keyExtractor={(l) => String(l.id)}
        renderItem={({ item }) => (
          <View style={styles.lesson}>
            <Text style={{ fontWeight: '600' }}>{item.order}. {item.title}</Text>
          </View>
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
});
