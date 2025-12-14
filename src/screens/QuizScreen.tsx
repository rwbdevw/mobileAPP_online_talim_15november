import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchLessonQuiz, submitQuiz } from '../api/mobile';
import { useQueryClient } from '@tanstack/react-query';

export function QuizScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { lessonId, courseId } = route.params as { lessonId: number; courseId: number };
  const qc = useQueryClient();

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [data, setData] = React.useState<Awaited<ReturnType<typeof fetchLessonQuiz>> | null>(null);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [result, setResult] = React.useState<{ score: number; passed: boolean } | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetchLessonQuiz(lessonId);
      setData(r);
      setResult(null);
      setAnswers({});
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? 'Testni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const setAnswer = (qid: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const onSubmit = async () => {
    try {
      if (!data?.quiz) return;
      setSubmitting(true);
      const payload: Record<string, string> = {};
      for (const q of data.quiz.questions) {
        const a = answers[q.id];
        if (a) payload[String(q.id)] = a;
      }
      const r = await submitQuiz(data.quiz.id, payload);
      if (!r?.success) {
        Alert.alert('Xatolik', 'Natija saqlanmadi');
        return;
      }
      setResult({ score: r.score, passed: r.passed });
      Alert.alert('Natija', `${r.score}% ${r.passed ? '(o\'tdingiz)' : '(o\'tmadingiz)'}`);
      // Invalidate progress queries so CourseDetail/MyCourses refresh
      qc.invalidateQueries({ queryKey: ['course-progress', courseId] });
      qc.invalidateQueries({ queryKey: ['my-courses'] });
    } catch (e: any) {
      Alert.alert('Xatolik', e?.message ?? 'Jo\'natishda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data?.exists) {
    return (
      <View style={styles.center}>
        <Text>Ushbu dars uchun test mavjud emas.</Text>
      </View>
    );
  }

  const qz = data.quiz!;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{qz.title}</Text>
      {!!qz.description && <Text style={styles.desc}>{qz.description}</Text>}
      <Text style={styles.meta}>O\'tish bali: {qz.passing_score}%</Text>
      {!!data?.passed && <Text style={[styles.meta, { color: '#16a34a' }]}>Eng yaxshi natija: {data.best_score}% (O\'tilgan)</Text>}

      {qz.questions.map((q, idx) => (
        <View key={q.id} style={styles.card}>
          <Text style={styles.qtitle}>{idx + 1}. {q.question}</Text>
          <View style={{ marginTop: 6 }}>
            {(['A','B','C','D'] as const).map((k) => {
              const label = (q.options as any)[k];
              if (!label) return null;
              const selected = answers[q.id] === k;
              return (
                <TouchableOpacity key={k} style={[styles.option, selected && styles.optionSelected]} onPress={() => setAnswer(q.id, k)}>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{k}. {label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <TouchableOpacity style={[styles.btn, { backgroundColor: '#2563eb' }]} disabled={submitting} onPress={onSubmit}>
        <Text style={styles.btnText}>{submitting ? 'Yuborilmoqda...' : 'Yuborish'}</Text>
      </TouchableOpacity>

      {!!result && (
        <View style={[styles.card, { borderColor: result.passed ? '#16a34a' : '#ef4444' }]}> 
          <Text style={styles.meta}>Natija: {result.score}% {result.passed ? '(O\'tdingiz)' : '(O\'tmadingiz)'}</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#10b981', marginTop: 8 }]} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Darsga qaytish</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  desc: { color: '#555', marginTop: 4 },
  meta: { color: '#444', marginTop: 6 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 10, marginTop: 12 },
  qtitle: { fontWeight: '700' },
  option: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, marginTop: 8 },
  optionSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  optionText: { color: '#111827' },
  optionTextSelected: { color: '#1d4ed8', fontWeight: '700' },
  btn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700' },
});
