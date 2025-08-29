// @ts-ignore
/* eslint-disable */

declare namespace LADR {
  type LoginParams = {
    username: string;
    password: string;
  };

  type LoginResult = {
    access_token: string;
    token_type: string;
    user_id: number;
    username: string;
    user_type: 'user' | 'transcriber';
    expires_in: number;
  };

  type CurrentUser = {
    id: number;
    username: string;
    user_type: 'user' | 'transcriber';
    created_at?: string;
    created_time?: string;
  };

  type TokenInfo = {
    user_id: number;
    username: string;
    user_type: 'user' | 'transcriber';
    expires_at: string;
  };

  type HealthStatus = {
    status: string;
    service: string;
  };

  type User = {
    id: number;
    username: string;
    created_at: string;
    password_hash: string;
  };

  type Transcriber = {
    id: number;
    username: string;
    created_time: string;
    password_hash: string;
  };

  type Student = {
    id: number;
    user_id: number;
    name: string;
  };

  type ExamPaper = {
    id: number;
    student_id: number;
    title: string;
    description: string;
    status: boolean;
    created_time: string;
  };

  type ExamPaperImage = {
    id: number;
    exam_paper_id: number;
    image_url: string;
    upload_order: number;
    status: boolean;
  };

  type KnowledgePoint = {
    id: number;
    name: string;
  };

  type Question = {
    id: number;
    exam_paper_id: number;
    image_id: number;
    student_id: number;
    content: string;
    is_correct: boolean;
    remark: string;
    created_time: string;
    updated_time: string;
  };

  type QuestionKnowledgePoint = {
    id: number;
    question_id: number;
    knowledge_point_id: number;
  };

  type ErrorResponse = {
    detail: string;
  };
}