import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, history, useParams } from '@umijs/max';
import { Card, Tag, Button, Descriptions, Space, message, Drawer, Input, Row, Col } from 'antd';
import { ArrowLeftOutlined, FileImageOutlined, LinkOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { getExamPaperImages, getExamPapers } from '@/services/ladr/api';

const ExamPaperDetail: React.FC = () => {
  const params = useParams();
  const intl = useIntl();
  const [examPaper, setExamPaper] = useState<LADR.ExamPaper>();
  const [images, setImages] = useState<LADR.ExamPaperImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<LADR.ExamPaperImage>();
  const [jsonInput, setJsonInput] = useState('');

  const examPaperId = params.id ? parseInt(params.id as string, 10) : undefined;

  useEffect(() => {
    const fetchData = async () => {
      if (!examPaperId) {
        message.error('Invalid exam paper ID');
        history.push('/exam-papers');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch exam paper details and all images in parallel
        const [examPapersData, allImagesData] = await Promise.all([
          getExamPapers({ skipErrorHandler: true }),
          getExamPaperImages(undefined, { skipErrorHandler: true }) // Get all images
        ]);

        // Find the specific exam paper
        const currentExamPaper = examPapersData?.find(paper => paper.id === examPaperId);
        if (!currentExamPaper) {
          message.error('Exam paper not found');
          history.push('/exam-papers');
          return;
        }

        // Filter images for this specific exam paper
        const filteredImages = allImagesData?.filter(image => image.exam_paper_id === examPaperId) || [];

        setExamPaper(currentExamPaper);
        setImages(filteredImages);
      } catch (error) {
        console.error('Failed to fetch exam paper details:', error);
        message.error('Failed to load exam paper details');
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
          onClick={() => {
            setSelectedImage(record);
            setWorkspaceVisible(true);
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
          setJsonInput('');
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
              style={{ height: '400px' }}
            >
              {/* Image details will be loaded here - currently blank */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                color: '#999',
                fontSize: '16px'
              }}>
                <FormattedMessage
                  id="pages.examPaperDetail.workspace.imageLoading"
                  defaultMessage="Image details will be loaded here"
                />
              </div>
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
              style={{ height: '400px' }}
            >
              <Input.TextArea
                placeholder='[{"content": "example", "is_correct": true}]'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={8}
                style={{ resize: 'none', marginBottom: 16 }}
              />
              <Button
                type="primary"
                onClick={() => {
                  // TODO: Handle JSON submission
                  console.log('Submitted JSON:', jsonInput);
                  message.success('JSON submitted successfully!');
                }}
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
          <ProTable
            columns={[
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
            ]}
            dataSource={[]}
            rowKey="id"
            search={false}
            pagination={false}
            locale={{
              emptyText: (
                <FormattedMessage
                  id="pages.examPaperDetail.workspace.table.empty"
                  defaultMessage="No data available"
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