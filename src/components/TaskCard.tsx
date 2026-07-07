"use client"

import { useDraggable } from "@dnd-kit/core"
import { motion } from "framer-motion"
import { Edit, Trash2, Calendar, Tag } from "lucide-react"
import { Task } from "@/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const priorityColors = {
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    high: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "glass rounded-lg p-4 cursor-grab active:cursor-grabbing",
        "border border-white/10 hover:border-white/20",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white text-sm flex-1">{task.title}</h3>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium border",
            priorityColors[task.priority]
          )}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <div className="flex items-center text-gray-400 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {format(new Date(task.due_date), "MMM d")}
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center flex-wrap gap-1 mt-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <div key={index} className="flex items-center text-xs text-gray-400">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </div>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
          )}
        </div>
      )}
    </motion.div>
  )
}
