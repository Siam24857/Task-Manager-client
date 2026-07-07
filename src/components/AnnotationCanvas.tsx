"use client"

import { useState, useRef, useEffect } from "react"
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva"
import { ZoomIn, ZoomOut, RotateCcw, Save, Trash2 } from "lucide-react"
import { Image as ImageType, Annotation } from "@/types"
import { cn } from "@/lib/utils"
import Konva from "konva"

interface AnnotationCanvasProps {
  image: ImageType
  annotations: Annotation[]
  onSave: (polygons: number[][], label: string) => void
  onDelete: (annotationId: number) => void
}

export default function AnnotationCanvas({ image, annotations, onSave, onDelete }: AnnotationCanvasProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [polygons, setPolygons] = useState<number[][]>([])
  const [currentPolygon, setCurrentPolygon] = useState<number[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [label, setLabel] = useState("")
  const [konvaImage, setKonvaImage] = useState<Konva.Image | null>(null)
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)
  const stageRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImageObj(img)
    }
    img.src = image.image_url
  }, [image])

  const handleWheel = (e: any) => {
    e.evt.preventDefault()
    const scaleBy = 1.1
    const oldScale = scale
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    setScale(newScale)
  }

  const handleStageClick = (e: any) => {
    if (!isDrawing) return

    const stage = e.target.getStage()
    const pointerPos = stage.getPointerPosition()
    const transformedPos = {
      x: (pointerPos.x - position.x) / scale,
      y: (pointerPos.y - position.y) / scale,
    }

    setCurrentPolygon([...currentPolygon, transformedPos.x, transformedPos.y])
  }

  const handleDoubleClick = () => {
    if (currentPolygon.length >= 6) {
      setPolygons([...polygons, currentPolygon])
      setCurrentPolygon([])
      setIsDrawing(false)
    }
  }

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

  const handleZoomIn = () => setScale(scale * 1.2)
  const handleZoomOut = () => setScale(scale / 1.2)
  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const startDrawing = () => {
    setIsDrawing(true)
    setCurrentPolygon([])
  }

  const cancelDrawing = () => {
    setIsDrawing(false)
    setCurrentPolygon([])
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Annotation Canvas</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <span className="text-white text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        {!isDrawing ? (
          <button
            onClick={startDrawing}
            className="px-4 py-2 gradient-bg rounded-lg text-white font-medium"
          >
            Start Drawing
          </button>
        ) : (
          <>
            <button
              onClick={cancelDrawing}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDoubleClick}
              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
              disabled={currentPolygon.length < 6}
            >
              Complete Polygon
            </button>
          </>
        )}
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

      <div className="relative bg-black/50 rounded-lg overflow-hidden" style={{ height: "500px" }}>
        <Stage
          ref={stageRef}
          width={800}
          height={500}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={!isDrawing}
          onWheel={handleWheel}
          onDblClick={handleDoubleClick}
          onClick={handleStageClick}
        >
          <Layer>
            {imageObj && (
              <KonvaImage
                image={imageObj}
                width={imageObj.width}
                height={imageObj.height}
              />
            )}

            {annotations.map((annotation) => (
              <Line
                key={annotation.id}
                points={annotation.polygons.flat()}
                stroke="#a855f7"
                strokeWidth={2 / scale}
                closed
                fill="rgba(168, 85, 247, 0.2)"
              />
            ))}

            {polygons.map((polygon, index) => (
              <Line
                key={index}
                points={polygon}
                stroke="#22c55e"
                strokeWidth={2 / scale}
                closed
                fill="rgba(34, 197, 94, 0.2)"
              />
            ))}

            {currentPolygon.length > 0 && (
              <Line
                points={currentPolygon}
                stroke="#3b82f6"
                strokeWidth={2 / scale}
                closed={false}
              />
            )}
          </Layer>
        </Stage>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-gray-400 text-sm">
          {isDrawing ? "Click to add points, double-click to complete" : "Click 'Start Drawing' to begin"}
        </div>
        {polygons.length > 0 && (
          <button
            onClick={handleSaveAnnotation}
            className="flex items-center space-x-2 px-4 py-2 gradient-bg rounded-lg text-white font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Save Annotation</span>
          </button>
        )}
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
