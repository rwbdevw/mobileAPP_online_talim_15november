import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { bootstrapAuth, useAuthStore } from '../store/auth';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
  },
};

export function AppNavigator() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    (async () => {
      await bootstrapAuth();
      setBootstrapped(true);
    })();
  }, []);

  if (!bootstrapped) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {accessToken ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
