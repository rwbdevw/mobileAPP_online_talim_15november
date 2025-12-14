import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchMyCourses, CourseItem } from '../api/mobile';
import { useNavigation } from '@react-navigation/native';

export function MyCoursesScreen() {
  const { data, isLoading, isRefetching, refetch } = useQuery({ queryKey: ['my-courses'], queryFn: fetchMyCourses });
  const navigation = useNavigation<any>();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mening kurslarim</Text>
      <FlatList
        data={(data?.items ?? []) as (CourseItem & { progress?: number })[]}
        keyExtractor={(c) => String(c.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id, title: item.title })}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!!item.category && <Text style={styles.chip}>{item.category}</Text>}
            {!!item.instructor && <Text style={styles.meta}>O'qituvchi: {item.instructor.username}</Text>}
            <Text style={styles.meta}>Narx: {item.price ?? 0}</Text>
            {typeof item.progress === 'number' && (
              <View style={{ marginTop: 8 }}>
                <View style={styles.progressWrap}>
                  <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, Math.round(item.progress ?? 0)))}%` }]} />
                </View>
                <Text style={[styles.meta, { marginTop: 4 }]}>Progress: {Math.round(item.progress)}%</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={<Text>Hali yozilgan kurslar yoʻq</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 12, marginBottom: 10 },
  cardTitle: { fontWeight: '700', marginBottom: 4 },
  chip: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', color: '#1d4ed8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginBottom: 6 },
  meta: { color: '#444' },
  progressWrap: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#2563eb' },
});
