import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../lib/api-client';

import TaskFilterForm from '../components/TaskFilter';
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

export const AssigneeMePage = () => {
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
    if (!loggedInUser || !access_token) {
      navigate('/login');
    }
  }, [loggedInUser, access_token, navigate]);
const assigneeId = 1;
  const fetchTasks = async () => {
    try {
      const response = (await apiClient.get(`/workspaces/tasks/assignee/${assigneeId}`,)) as any[];
      setTasks(response);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load assigned tasks');
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

  return (
    <div className="space-y-8">
      <TaskFilterForm onSearch={handleSearch} />

      <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
          <h2 className="text-3xl font-bold text-indigo-700">My Assigned Tasks</h2>
          <p className="text-gray-600 mt-1">Tasks assigned to you personally.</p>
        </div>

        <div className="px-6 py-6 overflow-x-auto">
          <TaskList tasks={searchTasks(tasks, filters)} onEdit={handleEdit} />
        </div>
      </section>
    </div>
  );
};
