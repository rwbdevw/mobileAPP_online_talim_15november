export const API_BASE_URL = 'https://online-talim-15november.onrender.com';

export const ENDPOINTS = {
  mobile: {
    login: '/api/mobile/login',
    refresh: '/api/mobile/refresh',
    me: '/api/mobile/me',
    courses: '/api/mobile/courses',
    courseDetail: (id: number | string) => `/api/mobile/courses/${id}`,
    lessonsOfCourse: (id: number | string) => `/api/mobile/courses/${id}/lessons`,
    enroll: (id: number | string) => `/api/mobile/enroll/${id}`,
    myCourses: '/api/mobile/my-courses',
    courseProgress: (id: number | string) => `/api/mobile/courses/${id}/progress`,
    lessonProgress: (id: number | string) => `/api/mobile/lessons/${id}/progress`,
    conversations: '/api/mobile/conversations',
    messages: (convId: number | string) => `/api/mobile/messages/${convId}`,
    messagesSend: '/api/mobile/messages/send',
    conversationRead: (convId: number | string) => `/api/mobile/conversations/${convId}/read`,
    devicesRegister: '/api/mobile/devices/register',
    devicesUnregister: '/api/mobile/devices/unregister',
  },
  legacy: {
    sendMessage: '/api/send-message',
    getMessages: (convId: number | string) => `/api/get-messages/${convId}`,
  },
} as const;
