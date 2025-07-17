import { useForm } from "react-hook-form";
import type { Filter } from "../types";

interface FormData {
  status: string;
  priority: string;
}
type Props = {
  onSearch: (filters: Filter) => void;
};

export default function TaskFilter({ onSearch }: Props) {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      status: '',
      priority: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const filters: Filter = {
      title: undefined
    };
    if (data.status && data.status !== '') {
      filters.status = data.status;
    }
    if (data.priority && data.priority !== '') {
      filters.priority = data.priority;
    }
    onSearch(filters);
  };
  return (
<form
  onSubmit={handleSubmit(onSubmit)}
  className="mt-6 flex flex-wrap justify-center items-end gap-4 p-5 bg-white rounded-2xl shadow-md max-w-5xl mx-auto"
>
  <div className="flex flex-col flex-1 min-w-[150px]">
    <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-700">
      Status
    </label>
    <select
      id="status"
      {...register('status')}
      className={`border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full ${errors.status ? 'border-red-500' : ''}`}
    >
      <option value="">All</option>
      <option value="to_do">To Do</option>
      <option value="in_progress">In Progress</option>
      <option value="done">Done</option>
    </select>
  </div>
  <div className="flex flex-col flex-1 min-w-[150px]">
    <label htmlFor="priority" className="mb-1 text-sm font-medium text-gray-700">
      Priority
    </label>
    <select
      id="priority"
      {...register('priority')}
      className={`border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full ${errors.priority ? 'border-red-500' : ''}`}
    >
      <option value="">All</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </div>
  <button
    type="submit"
    disabled={isSubmitting}
    className={`h-10 px-6 mt-6 bg-blue-500 text-white rounded font-semibold shadow hover:bg-blue-600 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
    style={{ minWidth: 100 }}
  >
    Search
  </button>
</form>

  )
}