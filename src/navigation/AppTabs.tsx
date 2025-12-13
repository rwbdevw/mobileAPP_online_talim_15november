import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MyCoursesScreen } from '../screens/MyCoursesScreen';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth';
import { InstructorCoursesScreen } from '../screens/InstructorCoursesScreen';

export type TabParamList = {
  Home: undefined;
  Courses: undefined;
  MyCourses: undefined;
  Teach: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function AppTabs() {
  const user = useAuthStore((s) => s.user);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ focused, color, size }) => {
          let icon: string = 'ellipse';
          if (route.name === 'Home') icon = focused ? 'home' : 'home-outline';
          else if (route.name === 'Courses') icon = focused ? 'book' : 'book-outline';
          else if (route.name === 'MyCourses') icon = focused ? 'school' : 'school-outline';
          else if (route.name === 'Teach') icon = focused ? 'easel' : 'easel-outline';
          else if (route.name === 'Chat') icon = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Profile') icon = focused ? 'person' : 'person-outline';
          return <Ionicons name={icon as any} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="MyCourses" component={MyCoursesScreen} options={{ title: 'My Courses' }} />
      {(user?.role === 'instructor' || user?.role === 'admin') && (
        <Tab.Screen name="Teach" component={InstructorCoursesScreen} />
      )}
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
