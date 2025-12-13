import { api } from './client';
import { ENDPOINTS } from '../config/constants';

export type CourseItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  instructor?: { id: number; username: string } | null;
  created_at?: string | null;
};

export type CourseDetail = CourseItem & {
  lessons: { id: number; title: string; order: number; video_url: string }[];
};

export async function fetchCourses(params?: { search?: string; limit?: number; offset?: number }) {
  const res = await api.get(ENDPOINTS.mobile.courses, { params });
  return res.data as { total: number; items: CourseItem[]; limit: number; offset: number };
}

export async function fetchCourseDetail(id: number) {
  const res = await api.get(ENDPOINTS.mobile.courseDetail(id));
  return res.data as CourseDetail;
}

export async function enrollCourse(id: number) {
  const res = await api.post(ENDPOINTS.mobile.enroll(id));
  return res.data as { success: boolean; enrolled: boolean };
}

export async function fetchMyCourses() {
  const res = await api.get(ENDPOINTS.mobile.myCourses);
  return res.data as { items: (CourseItem & { progress?: number })[] };
}

export type CourseProgress = {
  enrollment_progress: number;
  lessons: { lesson_id: number; completed: boolean; watch_time: number }[];
};

export async function fetchCourseProgress(courseId: number) {
  const res = await api.get(ENDPOINTS.mobile.courseProgress(courseId));
  return res.data as CourseProgress;
}

export async function sendLessonProgress(lessonId: number, payload: { watch_time?: number; completed?: boolean }) {
  const res = await api.post(ENDPOINTS.mobile.lessonProgress(lessonId), payload);
  return res.data as { success: boolean; enrollment_progress?: number };
}

export type ConversationItem = {
  id: number;
  other_user: { id: number; username: string };
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count: number;
};

export async function fetchConversations() {
  const res = await api.get(ENDPOINTS.mobile.conversations);
  return res.data as { items: ConversationItem[] };
}

export type MessageItem = { id: number; content: string; sender_id: number; created_at: string };

export async function fetchMessages(conversationId: number) {
  const res = await api.get(ENDPOINTS.mobile.messages(conversationId));
  return res.data as { items: MessageItem[] };
}

export async function sendMessage(recipientId: number, content: string) {
  const res = await api.post(ENDPOINTS.mobile.messagesSend, { recipient_id: recipientId, content });
  return res.data as { success: boolean; message?: MessageItem; message_id?: number };
}

export async function markConversationRead(conversationId: number) {
  const res = await api.post(ENDPOINTS.mobile.conversationRead(conversationId));
  return res.data as { success: boolean };
}

export async function searchUsers(q: string) {
  const res = await api.get('/api/mobile/users', { params: { search: q } });
  return res.data as { items: { id: number; username: string }[] };
}

export async function registerDeviceToken(token: string, platform?: string) {
  const res = await api.post(ENDPOINTS.mobile.devicesRegister, { token, platform });
  return res.data as { success: boolean };
}

export async function unregisterDeviceToken(token: string) {
  const res = await api.post(ENDPOINTS.mobile.devicesUnregister, { token });
  return res.data as { success: boolean };
}

export async function fetchInstructorCourses() {
  const res = await api.get(ENDPOINTS.mobile.instructorCourses);
  return res.data as { items: CourseItem[] };
}

export async function createInstructorCourse(payload: { title: string; description?: string; price?: number; category?: string }) {
  const res = await api.post(ENDPOINTS.mobile.instructorCourses, payload);
  return res.data as { id: number; title: string };
}

export async function addInstructorLesson(courseId: number, payload: { title: string; video_url?: string; order?: number }) {
  const res = await api.post(ENDPOINTS.mobile.instructorAddLesson(courseId), payload);
  return res.data as { id: number; title: string };
}
