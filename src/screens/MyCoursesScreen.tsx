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
            {typeof item.progress === 'number' && <Text style={styles.meta}>Progress: {Math.round(item.progress)}%</Text>}
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
});
