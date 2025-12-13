import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchInstructorCourses, deleteInstructorCourse } from '../api/mobile';
import { useNavigation } from '@react-navigation/native';

export function InstructorCoursesScreen() {
  const { data, isLoading, isRefetching, refetch } = useQuery({ queryKey: ['instructor-courses'], queryFn: fetchInstructorCourses });
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Courses</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => (navigation as any)?.getParent?.()?.navigate('NewCourse') }>
          <Text style={styles.primaryBtnText}>New Course</Text>
        </TouchableOpacity>
      </View>
      {(isLoading || isRefetching) && <ActivityIndicator style={{ marginVertical: 8 }} />}
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!!item.category && <Text style={styles.chip}>{item.category}</Text>}
            <Text style={styles.cardDesc}>{item.description}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => (navigation as any)?.getParent?.()?.navigate('ManageLessons', { courseId: item.id, title: item.title })}>
                <Text style={styles.outlineBtnText}>Manage Lessons</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => (navigation as any)?.getParent?.()?.navigate('EditCourse', { courseId: item.id, title: item.title })}>
                <Text style={styles.outlineBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: '#ef4444' }]}
                onPress={() =>
                  Alert.alert("O'chirish", "Kursni o'chirasizmi?", [
                    { text: 'Bekor qilish' },
                    {
                      text: "O'chirish",
                      style: 'destructive',
                      onPress: async () => {
                        await deleteInstructorCourse(item.id);
                        await (refetch?.());
                      },
                    },
                  ])
                }
              >
                <Text style={[styles.outlineBtnText, { color: '#ef4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!isLoading ? <Text>No courses yet</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#1d4ed8', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  card: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 10, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  chip: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', color: '#1d4ed8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginBottom: 6 },
  cardDesc: { color: '#555' },
  outlineBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#1d4ed8' },
  outlineBtnText: { color: '#1d4ed8', fontWeight: '700' },
})
