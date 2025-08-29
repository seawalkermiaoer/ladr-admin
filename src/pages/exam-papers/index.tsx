import type {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import {
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, history } from '@umijs/max';
import { Drawer, Tag, Button } from 'antd';
import React, { useRef, useState } from 'react';
import { getExamPapers } from '@/services/ladr/api';

type ExamPaperParams = {
  title?: string;
  student_id?: string;
  status?: boolean;
} & API.PageParams;

const ExamPapers: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<LADR.ExamPaper>();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<LADR.ExamPaper>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.examPapers.table.id"
          defaultMessage="ID"
        />
      ),
      dataIndex: 'id',
      width: 80,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.examPapers.table.title"
          defaultMessage="Title"
        />
      ),
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.examPapers.table.description"
          defaultMessage="Description"
        />
      ),
      dataIndex: 'description',
      valueType: 'textarea',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.examPapers.table.studentId"
          defaultMessage="Student ID"
        />
      ),
      dataIndex: 'student_id',
      width: 120,
    },
    {
      title: (
        <FormattedMessage
          id="pages.examPapers.table.status"
          defaultMessage="Status"
        />
      ),
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: {
          text: '已转录',
          status: 'Success',
        },
        false: {
          text: '未转录',
          status: 'Error',
        },
      },
      render: (_, record) => {
        // Use the entire record to access status
        const statusValue = record.status;
        
        // Force explicit comparison
        if (statusValue === true) {
          return <Tag color="green">已转录</Tag>;
        } else {
          return <Tag color="red">未转录</Tag>;
        }
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.examPapers.table.createdTime"
          defaultMessage="Created Time"
        />
      ),
      dataIndex: 'created_time',
      valueType: 'dateTime',
      width: 180,
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: (
        <FormattedMessage
          id="pages.examPapers.table.action"
          defaultMessage="Action"
        />
      ),
      dataIndex: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            history.push(`/exam-papers/${record.id}`);
          }}
        >
          <FormattedMessage
            id="pages.examPapers.action.viewDetails"
            defaultMessage="View Details"
          />
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<LADR.ExamPaper, ExamPaperParams>
        headerTitle={intl.formatMessage({
          id: 'pages.examPapers.title',
          defaultMessage: 'Exam Papers',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={async (params, sort, filter) => {
          try {
            const examPapers = await getExamPapers({
              skipErrorHandler: true,
            });
            
            // Simple client-side pagination and filtering
            let filteredData = examPapers || [];
            
            // Apply search filters
            if (params.title) {
              filteredData = filteredData.filter(item => 
                item.title?.toLowerCase().includes(params.title!.toLowerCase())
              );
            }
            
            if (params.student_id) {
              filteredData = filteredData.filter(item => 
                item.student_id?.toString().includes(params.student_id!)
              );
            }
            
            if (params.status !== undefined) {
              console.log('Filter params.status:', params.status, 'Type:', typeof params.status);
              
              // Handle both boolean and string values from ProTable
              const statusParam = params.status as any;
              const filterForTranscribed = statusParam === true || statusParam === 'true';
              
              if (filterForTranscribed) {
                // Filter for transcribed items (only boolean true)
                filteredData = filteredData.filter(item => {
                  return item.status === true;
                });
              } else {
                // Filter for not transcribed items (everything except boolean true)
                filteredData = filteredData.filter(item => {
                  return item.status !== true;
                });
              }
            }
            
            // Apply sorting - default sort by created_time desc
            if (sort && Object.keys(sort).length > 0) {
              const sortKey = Object.keys(sort)[0] as keyof LADR.ExamPaper;
              const sortOrder = sort[sortKey];
              
              filteredData.sort((a, b) => {
                const aVal = a[sortKey];
                const bVal = b[sortKey];
                
                if (sortOrder === 'ascend') {
                  return aVal > bVal ? 1 : -1;
                } else {
                  return aVal < bVal ? 1 : -1;
                }
              });
            } else {
              // Default sort by created_time desc
              filteredData.sort((a, b) => {
                const aTime = new Date(a.created_time || 0).getTime();
                const bTime = new Date(b.created_time || 0).getTime();
                return bTime - aTime; // descending order
              });
            }
            
            // Apply pagination
            const pageSize = params.pageSize || 20;
            const current = params.current || 1;
            const start = (current - 1) * pageSize;
            const end = start + pageSize;
            
            return {
              data: filteredData.slice(start, end),
              success: true,
              total: filteredData.length,
            };
          } catch (error) {
            console.error('Failed to fetch exam papers:', error);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        rowSelection={false}
      />
      
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.id && (
          <ProDescriptions<LADR.ExamPaper>
            column={2}
            title={currentRow?.title}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<LADR.ExamPaper>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ExamPapers;