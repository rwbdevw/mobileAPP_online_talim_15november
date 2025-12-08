# Online Ta'lim — React Native (Expo) App

## Quick start (Android)
- Talablar: Android Studio emulator yoki real qurilma (USB debugging), Node 18+
- Ishga tushirish:
```
npm run android
# yoki
npm start
# so'ng 'a' tugmasi bilan Android emulatorga
```
- Real qurilma (Expo Go): `npm start` → QR-kodni Expo Go bilan skan qiling

## Loyihalar tuzilmasi
```
app/
  App.tsx
  app.json
  babel.config.js
  index.ts
  src/
    api/           # axios client (+ DEMO_MODE)
    config/        # API_BASE_URL, ENDPOINTS
    navigation/    # AppNavigator, AuthStack, AppTabs
    screens/       # Login, Register, Home, Courses, Chat, Profile
    store/         # auth (zustand + SecureStore)
```

## Konfiguratsiya
- Backend URL: `src/config/constants.ts` ichida `API_BASE_URL`
- DEMO rejim: `src/api/client.ts` ichida `DEMO_MODE = true`
  - JWT endpointlar tayyor bo'lgach `false` qilib qo'ying
  - Kutilayotgan endpointlar: `/api/mobile/login`, `/api/mobile/refresh`, `/api/mobile/me`

## Eslatmalar
- React Navigation uchun `index.ts` boshida `react-native-gesture-handler` import mavjud
- Video va PDF:
  - Video: `expo-av`
  - PDF: hozircha WebView orqali (keyinchalik `react-native-pdf`)

## Keyingi qadamlar
- Backend’da JWT + mobil endpointlar
- Courses/Chat uchun real API bog'lash (react-query)
- Push (expo-notifications) va device token registratsiyasi
