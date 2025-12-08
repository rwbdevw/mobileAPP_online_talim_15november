import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchConversations } from '../api/mobile';
import { useNavigation } from '@react-navigation/native';

export function ChatScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['conversations'], queryFn: fetchConversations });
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Suhbatlar</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('NewChat')}>
          <Text style={styles.newBtnText}>Yangi suhbat</Text>
        </TouchableOpacity>
      </View>
      {(isLoading || isRefetching) && <ActivityIndicator style={{ marginVertical: 8 }} />}
      {!isLoading && data && (
        <FlatList
          data={data.items}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conv}
              onPress={() => navigation.navigate('Conversation', { conversationId: item.id, otherUser: item.other_user })}
            >
              <Text style={styles.name}>{item.other_user.username}</Text>
              {!!item.last_message && <Text numberOfLines={1} style={styles.last}>{item.last_message}</Text>}
              {item.unread_count > 0 && <Text style={styles.badge}>{item.unread_count}</Text>}
            </TouchableOpacity>
          )}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={<Text>Hali suhbatlar yo‘q</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  newBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start' },
  newBtnText: { color: 'white', fontWeight: '700' },
  conv: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 12, marginBottom: 10 },
  name: { fontWeight: '700', marginBottom: 4 },
  last: { color: '#666' },
  badge: { position: 'absolute', right: 12, top: 12, backgroundColor: '#ef4444', color: 'white', paddingHorizontal: 6, borderRadius: 999 },
});
