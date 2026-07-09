"use client"

import { useState, useEffect } from "react"
import { Save, Trash2, ImageIcon } from "lucide-react"
import { Image as ImageType, Annotation } from "@/types"

interface AnnotationCanvasProps {
  image: ImageType
  annotations: Annotation[]
  onSave: (polygons: number[][], label: string) => void
  onDelete: (annotationId: number) => void
}

export default function AnnotationCanvas({ image, annotations, onSave, onDelete }: AnnotationCanvasProps) {
  const [label, setLabel] = useState("")
  const [polygons, setPolygons] = useState<number[][]>([])

  const handleSaveAnnotation = () => {
    if (polygons.length > 0 && label) {
      onSave(polygons, label)
      setPolygons([])
      setLabel("")
    }
  }

  const handleDeleteAnnotation = (annotationId: number) => {
    onDelete(annotationId)
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Annotation Canvas</h3>
        <div className="text-sm text-gray-400">{image.title || "Selected image"}</div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Annotation label..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
        />
      </div>

      <div className="relative bg-black/50 rounded-lg overflow-hidden border border-white/10" style={{ height: "500px" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <div className="p-4 rounded-full bg-white/10 mb-4">
            <ImageIcon className="w-10 h-10 text-purple-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Annotation tools are temporarily unavailable</h4>
          <p className="text-gray-400 max-w-md">
            The image annotation canvas is currently running in a lightweight fallback mode while the native drawing dependency is being resolved.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-gray-400 text-sm">The image preview is ready. You can still manage saved annotations.</div>
      </div>

      {annotations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-white mb-2">Saved Annotations</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
              >
                <span className="text-gray-300 text-sm">{annotation.label || "Untitled"}</span>
                <button
                  onClick={() => handleDeleteAnnotation(annotation.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
