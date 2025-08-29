// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const LADR_BASE_URL = 'https://seawalkerxh-ladr.hf.space';

/** 登录接口 POST /api/v1/auth/login */
export async function login(body: LADR.LoginParams, options?: { [key: string]: any }) {
  return request<LADR.LoginResult>(`${LADR_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 转录员登录接口 POST /api/v1/auth/transcriber/login */
export async function transcriberLogin(body: LADR.LoginParams, options?: { [key: string]: any }) {
  return request<LADR.LoginResult>(`${LADR_BASE_URL}/api/v1/auth/transcriber/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/v1/auth/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<Record<string, any>>(`${LADR_BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 获取当前用户信息 GET /api/v1/auth/me */
export async function getCurrentUser(options?: { [key: string]: any }) {
  return request<LADR.CurrentUser>(`${LADR_BASE_URL}/api/v1/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 刷新令牌 POST /api/v1/auth/refresh */
export async function refreshToken(options?: { [key: string]: any }) {
  return request<LADR.LoginResult>(`${LADR_BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 退出所有会话 POST /api/v1/auth/logout/all */
export async function logoutAll(options?: { [key: string]: any }) {
  return request<Record<string, any>>(`${LADR_BASE_URL}/api/v1/auth/logout/all`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 获取令牌信息 GET /api/v1/auth/token/info */
export async function getTokenInfo(options?: { [key: string]: any }) {
  return request<LADR.TokenInfo>(`${LADR_BASE_URL}/api/v1/auth/token/info`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 系统健康检查 GET /health */
export async function healthCheck(options?: { [key: string]: any }) {
  return request<LADR.HealthStatus>(`${LADR_BASE_URL}/health`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取所有试卷 GET /api/v1/exam_papers */
export async function getExamPapers(options?: { [key: string]: any }) {
  return request<LADR.ExamPaper[]>(`${LADR_BASE_URL}/api/v1/exam_papers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 获取试卷图片 GET /api/v1/exam_paper_images */
export async function getExamPaperImages(examPaperId?: number, options?: { [key: string]: any }) {
  const url = examPaperId 
    ? `${LADR_BASE_URL}/api/v1/exam_paper_images?exam_paper_id=${examPaperId}`
    : `${LADR_BASE_URL}/api/v1/exam_paper_images`;
  
  return request<LADR.ExamPaperImage[]>(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}