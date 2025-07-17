import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

import apiClient from '../lib/api-client';
import { useAuthStore } from '../store/useAuthStore';
import type { Task } from '../types';

interface TaskFormData {
  title: string;
  start_date: string;
  due_date?: string;
  description?: string;
  status: 'to_do' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: number | string;
}

const validationSchema: yup.ObjectSchema<TaskFormData> = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  start_date: yup
    .string()
    .required('Start date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date'),
  due_date: yup
    .string()
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date')
    .test('due_date-after-start_date', 'Due date must be after start date', function (value) {
      if (!value) return true;
      const { start_date } = this.parent;
      return new Date(value) >= new Date(start_date);
    }),
  description: yup.string().optional().max(500, 'Description must be less than 500 characters'),
  status: yup
    .mixed<'to_do' | 'in_progress' | 'done'>()
    .required('Status is required')
    .oneOf(['to_do', 'in_progress', 'done'], 'Please select a valid status'),
  priority: yup
    .mixed<'low' | 'medium' | 'high'>()
    .required('Priority is required')
    .oneOf(['low', 'medium', 'high'], 'Please select a valid priority'),
  assignee_id: yup.number().optional().min(1, 'Assignee ID must be a positive number'),
});



export default function UpdateTaskPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const access_token = useAuthStore((state) => state.access_token);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: {isValid, errors, isSubmitting, dirtyFields },
  } = useForm<TaskFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const fetchTask = async () => {
    if (!id || !access_token) {
      toast.error('Invalid task ID or missing authentication');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Fetching task with ID:', id);
    
    try {
      const res = await apiClient.get(`/workspaces/tasks/${id}`);
      console.log('API Response:', res);
      console.log('Response type:', typeof res);
      
      // Vì interceptor đã return response.data, nên res chính là data
      const taskData = res as unknown as Task;
      
      // Kiểm tra xem taskData có hợp lệ không
      if (!taskData || typeof taskData !== 'object') {
        console.error('Invalid task data received:', taskData);
        toast.error('Invalid task data received');
        setLoading(false);
        return;
      }
      
      console.log('Task data:', taskData);
      setTask(taskData);
      
      // Reset form với data từ API
      reset({
        title: taskData.title || '',
        start_date: taskData.start_date
          ? new Date(taskData.start_date).toISOString().split('T')[0]
          : '',
        due_date: taskData.due_date
          ? new Date(taskData.due_date).toISOString().split('T')[0]
          : '',
        description: taskData.description || '',
        status: taskData.status || 'to_do',
        priority: taskData.priority || 'medium',
        assignee_id: taskData.assignee_id ?? '',
      });
      
    } catch (error: any) {
      console.error('Failed to fetch task:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Detailed error messages
      if (error.response?.status === 401) {
        toast.error('Unauthorized access. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('Task not found');
      } else if (error.response?.status === 403) {
        toast.error('Access forbidden');
      } else {
        toast.error('Failed to fetch task');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id, access_token]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: TaskFormData) => {
    if (!task || !task.id) {
      toast.error('No task data available');
      return;
    }

    const updatedTask: Task = {
      ...task,
      title: data.title,
      start_date: new Date(data.start_date),
      due_date: data.due_date ? new Date(data.due_date) : undefined,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      assignee_id: data.assignee_id ? Number(data.assignee_id) : undefined,
      completed_date: data.status === 'done' ? new Date() : undefined,
    };

    try {
      await apiClient.patch(`/workspaces/tasks/${task.id}`, updatedTask);
      toast.success('Task updated successfully!');
      navigate('/tasks');
    } catch (error: any) {
      console.error('Error updating task:', error);
      
      if (error.response?.status === 401) {
        toast.error('Unauthorized access. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('Task not found');
      } else if (error.response?.status === 403) {
        toast.error('Access forbidden');
      } else {
        toast.error('Failed to update task');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  // Error state - task not found
  if (!task) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
        <div className="text-center">
          <p className="text-red-600 text-lg">Task not found</p>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

 return (
  <div className="max-w-md mx-auto mt-8 p-5 bg-gradient-to-br from-indigo-50 via-white to-blue-50 mb-8 rounded-xl shadow-xl border border-indigo-100">
    <h2 className="text-2xl font-bold text-center text-indigo-700 drop-shadow-sm mb-6">
      Update Task
    </h2>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          placeholder="Enter task title"
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm
            ${errors.title ? 'border-red-400 focus:ring-red-200' : dirtyFields.title ? 'border-green-400 focus:ring-green-200' : 'border-gray-300 focus:ring-indigo-200'}`}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="start_date"
            {...register('start_date')}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm
              ${errors.start_date ? 'border-red-400 focus:ring-red-200' : dirtyFields.start_date ? 'border-green-400 focus:ring-green-200' : 'border-gray-300 focus:ring-indigo-200'}`}
          />
          {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
        </div>
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            {...register('due_date')}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm
              ${errors.due_date ? 'border-red-400 focus:ring-red-200' : dirtyFields.due_date ? 'border-green-400 focus:ring-green-200' : 'border-gray-300 focus:ring-indigo-200'}`}
          />
          {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            {...register('status')}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm
              ${errors.status ? 'border-red-400 focus:ring-red-200' : dirtyFields.status ? 'border-green-400 focus:ring-green-200' : 'border-gray-300 focus:ring-indigo-200'}`}
          >
            <option value="to_do">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            {...register('priority')}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm
              ${errors.priority ? 'border-red-400 focus:ring-red-200' : dirtyFields.priority ? 'border-green-400 focus:ring-green-200' : 'border-gray-300 focus:ring-indigo-200'}`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority.message}</p>}
        </div>
      </div>

        <div>
          <label htmlFor="assignee_id" className="block text-sm font-medium text-gray-700 mb-1">
            Assignee ID
          </label>
          <input
            type="text"
            id="assignee_id"
            {...register('assignee_id')}
            placeholder="Optional ID"
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm
              ${errors.assignee_id ? 'border-red-400 focus:ring-red-200' : dirtyFields.assignee_id ? 'border-green-400 focus:ring-green-200' : 'border-gray-300 focus:ring-indigo-200'}`}
          />
          {errors.assignee_id && <p className="text-xs text-red-500 mt-1">{errors.assignee_id.message}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            placeholder="Short description..."
            className={`w-full px-4 py-2 border rounded-md shadow-sm resize-none focus:outline-none focus:ring-2 transition-colors text-sm
              ${errors.description ? 'border-red-400 focus:ring-red-200' : dirtyFields.description ? 'border-green-400 focus:ring-green-200' : 'border-gray-300 focus:ring-indigo-200'}`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

      <div className="flex justify-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm shadow"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className={`px-5 py-2 rounded-md text-sm font-semibold shadow-md transition
            ${isSubmitting || !isValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          {isSubmitting ? 'Updating...' : 'Update'}
        </button>
      </div>

      <div className="text-center pt-4">
        <p className={`text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-500'}`}>
          {isValid ? 'Form is valid ✓' : 'Please fill in all required fields'}
        </p>
      </div>
    </form>
  </div>
);


}