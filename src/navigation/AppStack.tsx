import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabs } from './AppTabs';
import { ConversationScreen } from '../screens/ConversationScreen';
import { NewChatScreen } from '../screens/NewChatScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { LessonPlayerScreen } from '../screens/LessonPlayerScreen';

export type AppStackParamList = {
  Tabs: undefined;
  Conversation: { conversationId: number; otherUser: { id: number; username: string } };
  NewChat: undefined;
  CourseDetail: { courseId: number; title?: string };
  LessonPlayer: { title: string; videoUrl: string; lessonId: number; courseId: number };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Conversation" component={ConversationScreen} options={({ route }) => ({ title: route.params.otherUser.username })} />
      <Stack.Screen name="NewChat" component={NewChatScreen} options={{ title: 'Yangi suhbat' }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={({ route }) => ({ title: route.params.title ?? 'Kurs' })} />
      <Stack.Screen name="LessonPlayer" component={LessonPlayerScreen} options={({ route }) => ({ title: route.params.title ?? 'Dars' })} />
    </Stack.Navigator>
  );
}
