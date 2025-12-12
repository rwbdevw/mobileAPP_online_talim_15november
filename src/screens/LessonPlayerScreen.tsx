import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { API_BASE_URL } from '../config/constants';
import { sendLessonProgress } from '../api/mobile';
import { useQueryClient } from '@tanstack/react-query';

export function LessonPlayerScreen() {
  const route = useRoute<any>();
  const { title, videoUrl, lessonId, courseId }: { title: string; videoUrl: string; lessonId: number; courseId: number } = route.params;
  const qc = useQueryClient();
  const accumRef = React.useRef(0);

  const source = React.useMemo(() => {
    if (!videoUrl) return null;
    if (/^https?:\/\//i.test(videoUrl)) return { uri: videoUrl };
    return { uri: `${API_BASE_URL}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}` };
  }, [videoUrl]);

  if (!source) {
    return (
      <View style={styles.center}>
        <Text>Ushbu dars uchun video topilmadi.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.playerWrap}>
        <Video
          style={styles.video}
          source={source}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          onLoadStart={() => {}}
          onPlaybackStatusUpdate={(status: any) => {
            try {
              if (!status || status.isBuffering) return;
              if (status.didJustFinish) {
                sendLessonProgress(lessonId, { completed: true })
                  .then(() => {
                    qc.invalidateQueries({ queryKey: ['my-courses'] });
                    qc.invalidateQueries({ queryKey: ['course-progress', courseId] });
                  })
                  .catch(() => {});
                return;
              }
              if (status.isPlaying && typeof status.positionMillis === 'number') {
                // accumulate elapsed seconds between updates approximately
                const secs = 1; // approx per tick
                accumRef.current += secs;
                if (accumRef.current >= 10) {
                  const send = Math.floor(accumRef.current);
                  accumRef.current = 0;
                  sendLessonProgress(lessonId, { watch_time: send })
                    .then((r) => {
                      if (r?.enrollment_progress != null) {
                        qc.invalidateQueries({ queryKey: ['my-courses'] });
                        qc.invalidateQueries({ queryKey: ['course-progress', courseId] });
                      }
                    })
                    .catch(() => {});
                }
              }
            } catch {}
          }}
          onError={(e) => console.warn('Video error', e)}
        />
      </View>
      <Text style={styles.helper}>Agar video ochilmasa, internet aloqasini tekshiring yoki keyinroq urinib ko'ring.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  playerWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' },
  video: { width: '100%', height: '100%' },
  helper: { marginTop: 12, color: '#555' },
});
