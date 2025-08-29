import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, history, useParams, useLocation } from '@umijs/max';
import { Card, Tag, Button, Descriptions, Space, message, Drawer, Input, Row, Col } from 'antd';
import { ArrowLeftOutlined, FileImageOutlined, LinkOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { getExamPaperImagesByPaperId, getPresignedUrl, createQuestionsBatch, getQuestions } from '@/services/ladr/api';

const ExamPaperDetail: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  const intl = useIntl();
  const [examPaper, setExamPaper] = useState<LADR.ExamPaper>();
  const [images, setImages] = useState<LADR.ExamPaperImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<LADR.ExamPaperImage>();
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(''); 
  const [jsonInput, setJsonInput] = useState('');
  const [questions, setQuestions] = useState<LADR.Question[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const examPaperId = params.id ? parseInt(params.id as string, 10) : undefined;
  const examPaperFromState = (location.state as any)?.examPaper as LADR.ExamPaper;

  // Helper function to extract object_key from COS URL
  const extractObjectKey = (cosUrl: string): string => {
    try {
      const url = new URL(cosUrl);
      // Remove leading slash from pathname and clean any query parameters
      let objectKey = url.pathname.substring(1);
      
      // Remove any trailing '?' or other unwanted characters
      objectKey = objectKey.replace(/[?#].*$/, '').trim();
      
      console.log('Original URL:', cosUrl);
      console.log('Extracted object_key:', objectKey);
      
      return objectKey;
    } catch (error) {
      console.error('Failed to parse COS URL:', cosUrl, error);
      return '';
    }
  };

  // Function to get presigned URL for an image
  const getImagePresignedUrl = async (imageUrl: string): Promise<string> => {
    try {
      const objectKey = extractObjectKey(imageUrl);
      if (!objectKey) {
        console.error('Failed to extract object_key from URL:', imageUrl);
        return imageUrl; // Fallback to original URL
      }
      
      console.log('Requesting presigned URL for object_key:', objectKey);
      const response = await getPresignedUrl(objectKey, 3600);
      console.log('Presigned URL response:', response);
      return response.url;
    } catch (error) {
      console.error('Failed to get presigned URL for image:', imageUrl, error);
      return imageUrl; // Fallback to original URL
    }
  };

  // Function to load questions for the selected image
  const loadQuestionsForImage = async (imageId: number) => {
    try {
      const allQuestions = await getQuestions({ skipErrorHandler: true });
      const filteredQuestions = allQuestions?.filter(q => q.image_id === imageId) || [];
      setQuestions(filteredQuestions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setQuestions([]);
    }
  };

  // Function to handle JSON submission and create questions
  const handleJsonSubmission = async () => {
    if (!selectedImage || !examPaper) {
      message.error('No image or exam paper selected');
      return;
    }

    if (!jsonInput.trim()) {
      message.error('Please enter JSON data');
      return;
    }

    try {
      setSubmitting(true);
      
      // Parse and validate JSON input
      const parsedData = JSON.parse(jsonInput);
      
      if (!Array.isArray(parsedData)) {
        message.error('JSON must be an array of questions');
        return;
      }

      // Prepare questions data for batch creation
      const questionsToCreate: Partial<LADR.Question>[] = parsedData.map((item: any) => ({
        exam_paper_id: examPaper.id,
        image_id: selectedImage.id,
        student_id: examPaper.student_id,
        content: item.content || '',
        is_correct: Boolean(item.is_correct),
        remark: item.remark || '',
      }));

      // Create questions using batch API
      const createdQuestions = await createQuestionsBatch(questionsToCreate);
      
      // Update local state with new questions
      setQuestions(prev => [...prev, ...createdQuestions]);
      
      // Clear JSON input and show success message
      setJsonInput('');
      message.success(`Successfully created ${createdQuestions.length} questions!`);
      
    } catch (error: any) {
      console.error('Failed to create questions:', error);
      if (error instanceof SyntaxError) {
        message.error('Invalid JSON format. Please check your input.');
      } else {
        message.error('Failed to create questions. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!examPaperId) {
        message.error('Invalid exam paper ID');
        history.push('/exam-papers');
        return;
      }

      try {
        setLoading(true);
        
        // Use exam paper data from navigation state if available
        if (examPaperFromState) {
          setExamPaper(examPaperFromState);
        }
        
        // Fetch only the images for this specific exam paper
        const examPaperImages = await getExamPaperImagesByPaperId(examPaperId, { skipErrorHandler: true });
        
        setImages(examPaperImages || []);
      } catch (error) {
        console.error('Failed to fetch exam paper images:', error);
        message.error('Failed to load exam paper images');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examPaperId]);

  const handleBack = () => {
    history.push('/exam-papers');
  };

  const sortedImages = images.sort((a, b) => a.upload_order - b.upload_order);

  const imageColumns: ProColumns<LADR.ExamPaperImage>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.examPaperDetail.images.table.id"
          defaultMessage="ID"
        />
      ),
      dataIndex: 'id',
      width: 80,
      render: (id, record) => (
        <Button
          type="link"
          onClick={async () => {
            setSelectedImage(record);
            setWorkspaceVisible(true);
            // Get presigned URL for the selected image
            const presignedUrl = await getImagePresignedUrl(record.image_url);
            setSelectedImageUrl(presignedUrl);
            // Load questions for this image
            await loadQuestionsForImage(record.id);
          }}
        >
          {id}
        </Button>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.examPaperDetail.images.table.order"
          defaultMessage="Order"
        />
      ),
      dataIndex: 'upload_order',
      width: 80,
      sorter: (a, b) => a.upload_order - b.upload_order,
    },
    {
      title: (
        <FormattedMessage
          id="pages.examPaperDetail.images.table.url"
          defaultMessage="Image URL"
        />
      ),
      dataIndex: 'image_url',
      ellipsis: true,
      render: (text) => (
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 4,
          color: '#666'
        }}>
          <LinkOutlined />
          {text}
        </span>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.examPaperDetail.images.table.status"
          defaultMessage="Status"
        />
      ),
      dataIndex: 'status',
      width: 120,
      render: (status) => (
        status ? (
          <Tag color="green">
            <FormattedMessage
              id="pages.examPaperDetail.images.processed"
              defaultMessage="Processed"
            />
          </Tag>
        ) : (
          <Tag color="orange">
            <FormattedMessage
              id="pages.examPaperDetail.images.pending"
              defaultMessage="Pending"
            />
          </Tag>
        )
      ),
    },
  ];

  return (
    <PageContainer
      title={
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            type="text"
          >
            <FormattedMessage id="pages.examPaperDetail.back" defaultMessage="Back" />
          </Button>
          <FormattedMessage 
            id="pages.examPaperDetail.title" 
            defaultMessage="Exam Paper Details" 
          />
        </Space>
      }
      loading={loading}
    >
      {examPaper && (
        <Card 
          title={examPaper.title}
          style={{ marginBottom: 24 }}
        >
          <Descriptions column={2}>
            <Descriptions.Item 
              label={
                <FormattedMessage 
                  id="pages.examPapers.table.id" 
                  defaultMessage="ID" 
                />
              }
            >
              {examPaper.id}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <FormattedMessage 
                  id="pages.examPapers.table.studentId" 
                  defaultMessage="Student ID" 
                />
              }
            >
              {examPaper.student_id}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <FormattedMessage 
                  id="pages.examPapers.table.status" 
                  defaultMessage="Status" 
                />
              }
            >
              {examPaper.status ? (
                <Tag color="green">
                  <FormattedMessage 
                    id="pages.examPapers.status.transcribed" 
                    defaultMessage="Transcribed" 
                  />
                </Tag>
              ) : (
                <Tag color="red">
                  <FormattedMessage 
                    id="pages.examPapers.status.notTranscribed" 
                    defaultMessage="Not Transcribed" 
                  />
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <FormattedMessage 
                  id="pages.examPapers.table.createdTime" 
                  defaultMessage="Created Time" 
                />
              }
            >
              {new Date(examPaper.created_time).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item 
              label={
                <FormattedMessage 
                  id="pages.examPapers.table.description" 
                  defaultMessage="Description" 
                />
              }
              span={2}
            >
              {examPaper.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card
        title={
          <Space>
            <FileImageOutlined />
            <FormattedMessage 
              id="pages.examPaperDetail.images.title" 
              defaultMessage="Exam Paper Images" 
            />
            <Tag>{sortedImages.length}</Tag>
          </Space>
        }
      >
        <ProTable<LADR.ExamPaperImage>
          columns={imageColumns}
          dataSource={sortedImages}
          rowKey="id"
          search={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => (
              <FormattedMessage
                id="pages.examPaperDetail.images.table.total"
                defaultMessage="Showing {start}-{end} of {total} images"
                values={{
                  start: range[0],
                  end: range[1],
                  total,
                }}
              />
            ),
          }}
          locale={{
            emptyText: (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 0', 
                color: '#999' 
              }}>
                <FileImageOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>
                  <FormattedMessage 
                    id="pages.examPaperDetail.images.empty" 
                    defaultMessage="No images found for this exam paper" 
                  />
                </div>
              </div>
            ),
          }}
        />
      </Card>

      {/* Image Workspace Drawer */}
      <Drawer
        title={
          <FormattedMessage
            id="pages.examPaperDetail.workspace.title"
            defaultMessage="Image Workspace - ID: {id}"
            values={{ id: selectedImage?.id }}
          />
        }
        width="80%"
        open={workspaceVisible}
        onClose={() => {
          setWorkspaceVisible(false);
          setSelectedImage(undefined);
          setSelectedImageUrl('');
          setJsonInput('');
          setQuestions([]);
        }}
        destroyOnClose
      >
        <Row gutter={16} style={{ height: '100%' }}>
          {/* Left side - Image Details */}
          <Col span={12}>
            <Card
              title={
                <FormattedMessage
                  id="pages.examPaperDetail.workspace.imageDetails"
                  defaultMessage="Image Details"
                />
              }
              style={{ height: '800px' }}
            >
              {selectedImage ? (
                <div style={{ height: '700px', overflow: 'auto' }}>
                  {selectedImageUrl ? (
                    <img 
                      src={selectedImageUrl} 
                      alt={`Exam Paper Image ${selectedImage.upload_order}`}
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.innerHTML = `
                          <div style="
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 200px;
                            color: #999;
                            font-size: 14px;
                          ">
                            <div style="margin-bottom: 8px;">Failed to load image</div>
                            <div style="font-size: 12px; word-break: break-all; text-align: center;">
                              Original URL: ${selectedImage.image_url}
                            </div>
                          </div>
                        `;
                        (e.target as HTMLElement)?.parentNode?.appendChild(errorDiv);
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '600px',
                      color: '#999',
                      fontSize: '14px'
                    }}>
                      Loading secure image URL...
                    </div>
                  )}
                  <div style={{ marginTop: 16, padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Upload Order:</strong> {selectedImage.upload_order}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Status:</strong> 
                      {selectedImage.status ? (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          <FormattedMessage
                            id="pages.examPaperDetail.images.processed"
                            defaultMessage="Processed"
                          />
                        </Tag>
                      ) : (
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                          <FormattedMessage
                            id="pages.examPaperDetail.images.pending"
                            defaultMessage="Pending"
                          />
                        </Tag>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all', marginBottom: 8 }}>
                      <strong>Original URL:</strong> {selectedImage.image_url}
                    </div>
                    {selectedImageUrl && selectedImageUrl !== selectedImage.image_url && (
                      <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                        <strong>Secure URL:</strong> {selectedImageUrl}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '700px',
                  color: '#999',
                  fontSize: '16px'
                }}>
                  <FormattedMessage
                    id="pages.examPaperDetail.workspace.imageLoading"
                    defaultMessage="Image details will be loaded here"
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* Right side - JSON Input */}
          <Col span={12}>
            <Card
              title={
                <FormattedMessage
                  id="pages.examPaperDetail.workspace.jsonInput"
                  defaultMessage="JSON Input"
                />
              }
              style={{ height: '800px' }}
            >
              <Input.TextArea
                placeholder='[{"content": "What is 2+2?", "is_correct": true, "remark": "Simple math question"}]'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={18}
                style={{ resize: 'none', marginBottom: 16 }}
              />
              <Button
                type="primary"
                loading={submitting}
                onClick={handleJsonSubmission}
                style={{ width: '100%' }}
              >
                <FormattedMessage
                  id="pages.examPaperDetail.workspace.submitJson"
                  defaultMessage="Submit JSON"
                />
              </Button>
            </Card>
          </Col>
        </Row>

        {/* Bottom section - Empty Table */}
        <Card
          title={
            <FormattedMessage
              id="pages.examPaperDetail.workspace.dataTable"
              defaultMessage="Data Table"
            />
          }
          style={{ marginTop: 16 }}
        >
          <ProTable<LADR.Question>
            columns={[
              {
                title: (
                  <FormattedMessage
                    id="pages.examPaperDetail.workspace.table.id"
                    defaultMessage="ID"
                  />
                ),
                dataIndex: 'id',
                width: 80,
              },
              {
                title: (
                  <FormattedMessage
                    id="pages.examPaperDetail.workspace.table.content"
                    defaultMessage="Content"
                  />
                ),
                dataIndex: 'content',
                ellipsis: true,
              },
              {
                title: (
                  <FormattedMessage
                    id="pages.examPaperDetail.workspace.table.isCorrect"
                    defaultMessage="Is Correct"
                  />
                ),
                dataIndex: 'is_correct',
                width: 120,
                render: (value) => (
                  value ? (
                    <Tag color="green">
                      <FormattedMessage
                        id="pages.examPaperDetail.workspace.table.correct"
                        defaultMessage="Correct"
                      />
                    </Tag>
                  ) : (
                    <Tag color="red">
                      <FormattedMessage
                        id="pages.examPaperDetail.workspace.table.incorrect"
                        defaultMessage="Incorrect"
                      />
                    </Tag>
                  )
                ),
              },
              {
                title: (
                  <FormattedMessage
                    id="pages.examPaperDetail.workspace.table.remark"
                    defaultMessage="Remark"
                  />
                ),
                dataIndex: 'remark',
                ellipsis: true,
                width: 150,
              },
              {
                title: (
                  <FormattedMessage
                    id="pages.examPaperDetail.workspace.table.createdTime"
                    defaultMessage="Created Time"
                  />
                ),
                dataIndex: 'created_time',
                width: 180,
                render: (text) => text && typeof text === 'string' ? new Date(text).toLocaleString() : '-',
              },
            ]}
            dataSource={questions}
            rowKey="id"
            search={false}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total) => (
                <FormattedMessage
                  id="pages.examPaperDetail.workspace.table.total"
                  defaultMessage="Total {total} questions"
                  values={{ total }}
                />
              ),
            }}
            locale={{
              emptyText: (
                <FormattedMessage
                  id="pages.examPaperDetail.workspace.table.empty"
                  defaultMessage="No questions created yet. Submit JSON to create questions."
                />
              ),
            }}
          />
        </Card>
      </Drawer>
    </PageContainer>
  );
};

export default ExamPaperDetail;