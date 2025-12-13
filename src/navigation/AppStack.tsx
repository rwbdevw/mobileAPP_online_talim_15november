import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabs } from './AppTabs';
import { ConversationScreen } from '../screens/ConversationScreen';
import { NewChatScreen } from '../screens/NewChatScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { LessonPlayerScreen } from '../screens/LessonPlayerScreen';
import { NewCourseScreen } from '../screens/NewCourseScreen';
import { AddLessonScreen } from '../screens/AddLessonScreen';
import { ManageLessonsScreen } from '../screens/ManageLessonsScreen';
import { EditLessonScreen } from '../screens/EditLessonScreen';
import { EditCourseScreen } from '../screens/EditCourseScreen';

export type AppStackParamList = {
  Tabs: undefined;
  Conversation: { conversationId: number; otherUser: { id: number; username: string } };
  NewChat: undefined;
  CourseDetail: { courseId: number; title?: string };
  LessonPlayer: { title: string; videoUrl: string; lessonId: number; courseId: number };
  NewCourse: undefined;
  AddLesson: { courseId: number; title?: string };
  ManageLessons: { courseId: number; title?: string };
  EditLesson: { lessonId: number; title?: string; video_url?: string; order?: number };
  EditCourse: { courseId: number; title?: string };
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
      <Stack.Screen name="NewCourse" component={NewCourseScreen} options={{ title: 'Yangi kurs' }} />
      <Stack.Screen name="AddLesson" component={AddLessonScreen} options={({ route }) => ({ title: route.params.title ? `Dars qo'shish - ${route.params.title}` : `Dars qo'shish` })} />
      <Stack.Screen name="ManageLessons" component={ManageLessonsScreen} options={({ route }) => ({ title: route.params.title ? `Darslar - ${route.params.title}` : 'Darslar' })} />
      <Stack.Screen name="EditLesson" component={EditLessonScreen} options={{ title: 'Darsni tahrirlash' }} />
      <Stack.Screen name="EditCourse" component={EditCourseScreen} options={{ title: 'Kursni tahrirlash' }} />
    </Stack.Navigator>
  );
}
