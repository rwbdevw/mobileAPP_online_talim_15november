import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchCourses } from '../api/mobile';

export function CoursesScreen() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['courses', search],
    queryFn: () => fetchCourses({ search, limit: 20, offset: 0 }),
  });
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kurslar</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Qidirish"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => refetch()}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.btn} onPress={() => refetch()}>
          <Text style={styles.btnText}>Qidir</Text>
        </TouchableOpacity>
      </View>
      {(isLoading || isRefetching) && (
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      )}
      {!isLoading && data && (
        <FlatList
          data={data.items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.card}
              onPress={() => navigation.navigate('CourseDetail', { courseId: item.id, title: item.title })}
            >
              <Text style={styles.title}>{item.title}</Text>
              {!!item.category && <Text style={styles.chip}>{item.category}</Text>}
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.meta}>Narx: {item.price ?? 0}</Text>
              {item.instructor && <Text style={styles.meta}>O'qituvchi: {item.instructor.username}</Text>}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={styles.center}><Text>Hech narsa topilmadi</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 8 },
  search: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  chip: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', color: '#1d4ed8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginBottom: 6 },
  desc: { color: '#555', marginBottom: 6 },
  meta: { color: '#444' },
});
