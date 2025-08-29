// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

// const LADR_BASE_URL = 'https://seawalkerxh-ladr.hf.space';
const LADR_BASE_URL = "http://127.0.0.1:8000";

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

/** 获取单个试卷 GET /api/v1/exam_papers/{exam_paper_id} */
export async function getExamPaper(examPaperId: number, options?: { [key: string]: any }) {
  return request<LADR.ExamPaper>(`${LADR_BASE_URL}/api/v1/exam_papers/${examPaperId}`, {
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

/** 获取指定试卷的所有图片 GET /api/v1/exam_papers/{exam_paper_id}/images */
export async function getExamPaperImagesByPaperId(examPaperId: number, options?: { [key: string]: any }) {
  return request<LADR.ExamPaperImage[]>(`${LADR_BASE_URL}/api/v1/exam_papers/${examPaperId}/images`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 获取所有题目 GET /api/v1/questions */
export async function getQuestions(options?: { [key: string]: any }) {
  return request<LADR.Question[]>(`${LADR_BASE_URL}/api/v1/questions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 获取单个题目 GET /api/v1/questions/{question_id} */
export async function getQuestion(questionId: number, options?: { [key: string]: any }) {
  return request<LADR.Question>(`${LADR_BASE_URL}/api/v1/questions/${questionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 创建题目 POST /api/v1/questions */
export async function createQuestion(body: Partial<LADR.Question>, options?: { [key: string]: any }) {
  return request<LADR.Question>(`${LADR_BASE_URL}/api/v1/questions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量创建题目 POST /api/v1/questions/batch */
export async function createQuestionsBatch(questions: Partial<LADR.Question>[], options?: { [key: string]: any }) {
  return request<LADR.Question[]>(`${LADR_BASE_URL}/api/v1/questions/batch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
      'Content-Type': 'application/json',
    },
    data: questions, // Use 'data' for UmiJS request body
    ...(options || {}),
  });
}

/** 更新题目 PUT /api/v1/questions/{question_id} */
export async function updateQuestion(questionId: number, body: Partial<LADR.Question>, options?: { [key: string]: any }) {
  return request<LADR.Question>(`${LADR_BASE_URL}/api/v1/questions/${questionId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除题目 DELETE /api/v1/questions/{question_id} */
export async function deleteQuestion(questionId: number, options?: { [key: string]: any }) {
  return request<any>(`${LADR_BASE_URL}/api/v1/questions/${questionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}

/** 获取预签名URL GET /api/v1/cos/presigned-url */
export async function getPresignedUrl(
  objectKey: string,
  expiresIn?: number,
  imageProcessing?: string | null,
  options?: { [key: string]: any }
) {
  // Clean and validate object_key to remove any unwanted characters
  const cleanObjectKey = objectKey.trim().replace(/[?#].*$/, '');
  
  if (!cleanObjectKey) {
    throw new Error('Invalid object_key provided');
  }
  
  // Use UmiJS request with params instead of manual URL construction
  const params: any = {
    object_key: cleanObjectKey,
  };
  
  // Only add expires_in if it's a valid integer
  if (expiresIn && Number.isInteger(expiresIn) && expiresIn > 0) {
    params.expires_in = expiresIn;
  }
  
  // Only add image_processing if it's a non-empty string
  if (imageProcessing && typeof imageProcessing === 'string' && imageProcessing.trim() !== '') {
    params.image_processing = imageProcessing.trim();
  }
  
  console.log('Request params:', params);
  
  return request<LADR.PresignedUrlResponse>(`${LADR_BASE_URL}/api/v1/cos/presigned-url`, {
    method: 'GET',
    params, // Let UmiJS handle the query string construction
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('ladr_token')}`,
    },
    ...(options || {}),
  });
}