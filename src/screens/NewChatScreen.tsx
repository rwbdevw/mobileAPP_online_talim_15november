import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchUsers, sendMessage, fetchConversations } from '../api/mobile';

export function NewChatScreen() {
  const [q, setQ] = useState('');
  const [message, setMessage] = useState('Salom!');
  const [selected, setSelected] = useState<{ id: number; username: string } | null>(null);
  const navigation = useNavigation<any>();
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['search-users', q],
    queryFn: () => searchUsers(q),
    enabled: q.length > 0,
  });

  const onSend = async () => {
    if (!selected) {
      Alert.alert('Tanlang', 'Avval foydalanuvchini tanlang');
      return;
    }
    const content = message.trim();
    if (!content) {
      Alert.alert('Xabar', 'Xabar matnini kiriting');
      return;
    }
    await sendMessage(selected.id, content);
    await qc.invalidateQueries({ queryKey: ['conversations'] });
    const convs = await fetchConversations();
    const conv = convs.items.find((c) => c.other_user.id === selected.id);
    if (conv) {
      navigation.replace('Conversation', { conversationId: conv.id, otherUser: selected });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Foydalanuvchi toping</Text>
      <View style={styles.row}>
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#94A3B8" value={q} onChangeText={setQ} onSubmitEditing={() => refetch()} />
        <TouchableOpacity style={styles.btn} onPress={() => refetch()}>
          <Text style={styles.btnText}>Qidir</Text>
        </TouchableOpacity>
      </View>
      {(isLoading || isRefetching) && <ActivityIndicator style={{ marginVertical: 8 }} />}
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(u) => String(u.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.user, selected?.id === item.id && styles.userSel]} onPress={() => setSelected(item)}>
            <Text style={styles.userName}>{item.username}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Natija yo‘q</Text>}
      />
      <Text style={styles.header}>Xabar</Text>
      <View style={styles.row}>
        <TextInput style={styles.input} placeholder="Xabar yozing..." placeholderTextColor="#94A3B8" value={message} onChangeText={setMessage} />
        <TouchableOpacity style={styles.btn} onPress={onSend}>
          <Text style={styles.btnText}>Yuborish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 16, borderRadius: 8, height: 44, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: '600' },
  user: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginBottom: 8 },
  userSel: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  userName: { fontWeight: '600' },
});
