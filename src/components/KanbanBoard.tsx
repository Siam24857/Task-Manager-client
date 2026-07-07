"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Task } from "@/types"
import TaskCard from "./TaskCard"
import { cn } from "@/lib/utils"

const COLUMNS = [
  { id: "todo", title: "To Do", color: "from-blue-500 to-blue-600" },
  { id: "in_progress", title: "In Progress", color: "from-yellow-500 to-yellow-600" },
  { id: "done", title: "Done", color: "from-green-500 to-green-600" },
]

interface KanbanBoardProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onUpdate: (task: Task) => void
}

export default function KanbanBoard({ tasks, onEdit, onDelete, onUpdate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = Number(active.id)
    const newStatus = over.id as string

    if (newStatus === activeTask?.status) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const updatedTask = { ...task, status: newStatus as "todo" | "in_progress" | "done" }
    onUpdate(updatedTask)

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/tasks/${taskId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (error) {
      console.error("Failed to update task status")
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id)

          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">{column.title}</h2>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r",
                  column.color,
                  "text-white"
                )}>
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[200px]" data-status={column.id}>
                {columnTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-lg">
                    <p className="text-gray-500 text-sm">No tasks</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
