import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import apiClient from '../lib/api-client';

interface TaskFormData {
  title: string;
  start_date: string;
  due_date?: string;
  description?: string;
  status: 'to_do' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: string;
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
    .matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Please enter a valid date'),
  due_date: yup
    .string()
    .optional()
    .matches(/^$|^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Please enter a valid date')
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
  assignee_id: yup
    .string()
    .optional()
    .matches(/^$|^[0-9]+$/, 'Assignee ID must be a number'),
});

export default function CreateTaskPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, dirtyFields },
    reset,
  } = useForm<TaskFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      start_date: new Date().toISOString().split('T')[0],
      due_date: '',
      description: '',
      status: 'to_do',
      priority: 'medium',
      assignee_id: '',
    },
  });

  const onSubmit = async (data: TaskFormData): Promise<void> => {
    try {
      const payload = {
        title: data.title,
        start_date: data.start_date,
        due_date: data.due_date || null,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        assignee_id: data.assignee_id ? Number(data.assignee_id) : null,
      };

      await apiClient.post('/workspaces/tasks', payload);

      navigate('/tasks');
      reset();
      toast.success('Task created successfully!');
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error?.response?.data?.detail || 'Failed to create task. Please try again.');
    }
  };

return (
  <div className="max-w-md mx-auto mt-10 p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50 mb-10 rounded-xl shadow-xl border border-indigo-100">
    <h2 className="text-3xl font-bold text-center text-indigo-700 drop-shadow-sm mb-6">
      Create New Task
    </h2>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          placeholder="Task title"
          className={`w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors
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
            id="start_date"
            type="date"
            {...register('start_date')}
            className={`w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors
              ${errors.start_date ? 'border-red-400 focus:ring-red-200' : dirtyFields.start_date ? 'border-green-400 focus:ring-green-200' : 'border-gray-300 focus:ring-indigo-200'}`}
          />
          {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
        </div>
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            id="due_date"
            type="date"
            {...register('due_date')}
            className={`w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors
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
            className={`w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors
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
            className={`w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors
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
            id="assignee_id"
            type="text"
            {...register('assignee_id')}
            placeholder="Optional"
            className={`w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors
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
            className={`w-full px-4 py-2 text-sm border rounded-md shadow-sm resize-none focus:outline-none focus:ring-2 transition-colors
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
          {isSubmitting ? 'Creating...' : 'Create'}
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



