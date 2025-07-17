import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuthStore } from '../store/useAuthStore'; // đúng đường dẫn của bạn
import apiClient from '../lib/api-client';

import TaskFilter from '../components/TaskFilter';
import TaskList from '../components/TaskList';
import type { Filter, Task } from '../types';

function searchTasks(tasks: Task[], filters: Filter): Task[] {
  return tasks.filter((task) => {
    const matchesStatus = filters.status ? task.status === filters.status : true;
    const matchesTitle = filters.title
      ? task.title.toLowerCase().includes(filters.title.toLowerCase())
      : true;
    const matchesPriority = filters.priority ? task.priority === filters.priority : true;

    return matchesStatus && matchesTitle && matchesPriority;
  });
}

export const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<Filter>({
    status: undefined,
    title: '',
    priority: undefined,
  });

  const access_token = useAuthStore((state) => state.access_token);
  const loggedInUser = useAuthStore((state) => state.loggedInUser);
  useEffect(() => {
    console.log('Access Token:', access_token);
    console.log('Logged In User:', loggedInUser);
    if (!loggedInUser || !access_token) {
      navigate('/login');
    }
  }, [loggedInUser, navigate]);

  const fetchTasks = async () => {
      try {
        const tasks = (await apiClient.get('/workspaces/tasks', )) as any[];
        console.log(tasks);
        setTasks(tasks);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

  useEffect(() => {
    if (access_token) {
      fetchTasks();
    }
  }, [access_token]);

  const handleSearch = (newFilters: Filter) => {
    setFilters(newFilters);
  };

  const handleEdit = (taskId: string | number | undefined) => {
    navigate(`/update/${taskId}`);
  };

  const handleDelete = async (taskId: string | number | undefined) => {
    if (!taskId) return;
    const confirm = window.confirm('Are you sure you want to delete this task?');
    if (!confirm) return;

    try {
      await apiClient.delete(`/workspaces/tasks/${taskId}`);
      toast.success('Task deleted successfully!');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-8">
      <TaskFilter onSearch={handleSearch} />s

      <section className="bg-white rounded-2xl shadow-xl">
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
          <h2 className="text-3xl font-bold text-indigo-700">Our Tasks</h2>
          <p className="text-gray-600 mt-1">Manage and track all our tasks in one place.</p>
        </div>

        <div className="px-6 py-6 overflow-x-auto">
          <TaskList
            tasks={searchTasks(tasks, filters)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </section>
    </div>
  );
};
