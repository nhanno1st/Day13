import { FaEdit, FaTrash } from "react-icons/fa";
import type { Task } from "../types";
import { ButtonWithRole } from "./ButtonWithRole";

type Props = {
  tasks: Task[];
  onEdit?: (taskId: string | number | undefined) => void;
  onDelete?: (taskId: string | number | undefined) => void;
};

function formatDate(date?: string | Date | null) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return isNaN(d?.getTime() ?? NaN) ? "-" : d.toLocaleDateString();
}

function getStatusColor(status: string) {
  switch (status) {
    case "done":
      return "text-green-700 bg-green-100 border border-green-300";
    case "in_progress":
      return "text-blue-700 bg-blue-100 border border-blue-300";
    case "to_do":
      return "text-yellow-800 bg-yellow-100 border border-yellow-300";
    default:
      return "text-gray-600 bg-gray-100 border border-gray-300";
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "text-red-700 bg-red-100 border border-red-300";
    case "medium":
      return "text-yellow-800 bg-yellow-100 border border-yellow-300";
    case "low":
      return "text-green-700 bg-green-100 border border-green-300";
    default:
      return "text-gray-600 bg-gray-100 border border-gray-300";
  }
}

export default function TaskList({ tasks, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="text-xs uppercase bg-blue-50 text-blue-800 tracking-wider">
          <tr>
            <th className="px-6 py-4">Task</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Priority</th>
            <th className="px-6 py-4">Start</th>
            <th className="px-6 py-4">Due</th>
            <th className="px-6 py-4">Completed</th>
            <th className="px-6 py-4">Assignee</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-slate-50">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="font-semibold text-gray-900">{task.title}</div>
                <div className="text-xs text-gray-500 truncate max-w-[220px]">
                  {task.description}
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full font-semibold ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full font-semibold ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {formatDate(task.start_date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {formatDate(task.due_date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {formatDate(task.completed_date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-800">
                {task.assignee_id || (
                  <span className="italic text-gray-400">Unassigned</span>
                )}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <ButtonWithRole allowedRoles={['Managers']}>
                <button
                  onClick={() => onEdit?.(task.id)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition"
                >
                  <FaEdit />
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(task.id)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition"
                >
                  <FaTrash />
                  Delete
                </button>
                </ButtonWithRole>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="text-center py-8 text-gray-400 italic"
              >
                No tasks available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
