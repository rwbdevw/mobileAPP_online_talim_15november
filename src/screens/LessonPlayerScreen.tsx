import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
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
  const [buffering, setBuffering] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [videoKey, setVideoKey] = React.useState(0);

  const source = React.useMemo(() => {
    const raw = (videoUrl || '').trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return { uri: raw };
    const endsVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(raw);
    // '/uploads/...'
    if (raw.startsWith('/uploads/')) return { uri: `${API_BASE_URL}${raw}` };
    // 'uploads/...'
    if (raw.startsWith('uploads/')) return { uri: `${API_BASE_URL}/${raw}` };
    // bare filename like 'file.mp4'
    if (endsVideo && !raw.includes('/')) return { uri: `${API_BASE_URL}/uploads/${raw}` };
    // fallback: treat as relative path
    return { uri: `${API_BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}` };
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
          key={videoKey}
          style={styles.video}
          source={source}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          onLoadStart={() => {
            setError(null);
            setBuffering(true);
          }}
          onPlaybackStatusUpdate={(status: any) => {
            try {
              if (!status) return;
              if (status.isBuffering) {
                setBuffering(true);
              } else {
                setBuffering(false);
              }
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
          onError={(e) => {
            console.warn('Video error', e);
            setBuffering(false);
            setError('Video yuklanmadi. Internet aloqasini tekshiring va qayta urinib ko\'ring.');
          }}
        />
        {(buffering && !error) && (
          <View style={styles.overlay}> 
            <ActivityIndicator color="#fff" size="large" />
            <Text style={styles.overlayText}>Yuklanmoqda...</Text>
          </View>
        )}
        {!!error && (
          <View style={styles.overlay}> 
            <Text style={styles.overlayText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setError(null); setBuffering(true); setVideoKey((k) => k + 1); }}>
              <Text style={styles.retryText}>Qayta urinish</Text>
            </TouchableOpacity>
            {!!(source as any)?.uri && (
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: '#10b981' }]} onPress={() => Linking.openURL((source as any).uri)}>
                <Text style={styles.retryText}>Brauzerda ochish</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  overlayText: { color: '#fff', marginTop: 8 },
  retryBtn: { marginTop: 10, backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  helper: { marginTop: 12, color: '#555' },
});
