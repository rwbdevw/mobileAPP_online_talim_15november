import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMessages, sendMessage, MessageItem, markConversationRead } from '../api/mobile';

export function ConversationScreen() {
  const route = useRoute<any>();
  const { conversationId, otherUser } = route.params as { conversationId: number; otherUser: { id: number; username: string } };
  const [text, setText] = useState('');
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
  });

  React.useEffect(() => {
    // mark as read on open
    markConversationRead(conversationId)
      .then(() => {
        qc.invalidateQueries({ queryKey: ['conversations'] });
      })
      .catch(() => {});
  }, [conversationId]);

  const onSend = async () => {
    const content = text.trim();
    if (!content) return;
    setText('');
    await sendMessage(otherUser.id, content);
    await qc.invalidateQueries({ queryKey: ['messages', conversationId] });
    await qc.invalidateQueries({ queryKey: ['conversations'] });
    refetch();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.container}>
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12 }}
          data={(data?.items ?? []) as MessageItem[]}
          keyExtractor={(m) => String(m.id)}
          renderItem={({ item }) => {
            const isLeft = item.sender_id === otherUser.id;
            return (
              <View style={[styles.bubble, isLeft ? styles.left : styles.right]}>
                <Text style={isLeft ? styles.msgLeft : styles.msgRight}>{item.content}</Text>
                <Text style={isLeft ? styles.timeLeft : styles.timeRight}>{new Date(item.created_at).toLocaleTimeString()}</Text>
              </View>
            );
          }}
          onRefresh={refetch}
          refreshing={isRefetching || isLoading}
        />
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Xabar yozing..." value={text} onChangeText={setText} />
          <TouchableOpacity style={styles.send} onPress={onSend}>
            <Text style={{ color: 'white', fontWeight: '700' }}>Yuborish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 8 },
  left: { alignSelf: 'flex-start', backgroundColor: '#f3f4f6' },
  right: { alignSelf: 'flex-end', backgroundColor: '#2563eb' },
  msgLeft: { color: '#111' },
  msgRight: { color: 'white' },
  timeLeft: { color: '#666', fontSize: 10, marginTop: 4 },
  timeRight: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 4 },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#eee', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, height: 44, backgroundColor: '#fff' },
  send: { backgroundColor: '#2563eb', paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
