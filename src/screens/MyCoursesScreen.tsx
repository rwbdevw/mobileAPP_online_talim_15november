import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchMyCourses, CourseItem } from '../api/mobile';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { colors } from '../theme';

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
          <Card onPress={() => navigation.navigate('CourseDetail', { courseId: item.id, title: item.title })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              {!!item.category && <Text style={styles.chip}>{item.category}</Text>}
              {!!item.instructor && <Text style={[styles.meta, { marginLeft: 8 }]}>O'qituvchi: {item.instructor.username}</Text>}
            </View>
            <Text style={styles.meta}>Narx: {item.price ?? 0}</Text>
            {typeof item.progress === 'number' && (
              <View style={{ marginTop: 8 }}>
                <ProgressBar value={item.progress} />
                <Text style={[styles.meta, { marginTop: 4 }]}>Progress: {Math.round(item.progress)}%</Text>
              </View>
            )}
          </Card>
        )}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={<Text>Hali yozilgan kurslar yoʻq</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: colors.text },
  cardTitle: { fontWeight: '700', marginBottom: 6, fontSize: 16, color: colors.text },
  chip: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', color: '#1d4ed8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  meta: { color: '#444' },
});
