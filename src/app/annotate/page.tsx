"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload, Plus, Trash2, Save, ZoomIn, ZoomOut, RotateCcw, LogOut, LayoutGrid } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { Image as ImageType, Annotation } from "@/types"
import { toast } from "react-hot-toast"
import ImageGallery from "@/components/ImageGallery"
import AnnotationCanvas from "@/components/AnnotationCanvas"
import { cn } from "@/lib/utils"

export default function AnnotatePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [images, setImages] = useState<ImageType[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchImages()
  }, [user, router])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await api.get("/images/")
      setImages(response.data)
      if (response.data.length > 0) {
        setSelectedImage(response.data[0])
        await fetchAnnotations(response.data[0].id)
      }
    } catch (error) {
      toast.error("Failed to fetch images")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnotations = async (imageId: number) => {
    try {
      const response = await api.get("/annotations/", { params: { image_id: imageId } })
      setAnnotations(response.data)
    } catch (error) {
      console.error("Failed to fetch annotations")
    }
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    router.push("/login")
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("image", file)
    formData.append("title", file.name)

    try {
      const response = await api.post("/images/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setImages([...images, response.data])
      setSelectedImage(response.data)
      toast.success("Image uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageSelect = (image: ImageType) => {
    setSelectedImage(image)
    fetchAnnotations(image.id)
  }

  const handleAnnotationSave = async (polygons: number[][], label: string) => {
    if (!selectedImage) return

    try {
      const response = await api.post("/annotations/", {
        image: selectedImage.id,
        polygons,
        label,
      })
      setAnnotations([...annotations, response.data])
      toast.success("Annotation saved successfully")
    } catch (error) {
      toast.error("Failed to save annotation")
    }
  }

  const handleAnnotationDelete = async (annotationId: number) => {
    try {
      await api.delete(`/annotations/${annotationId}/`)
      setAnnotations(annotations.filter((a) => a.id !== annotationId))
      toast.success("Annotation deleted successfully")
    } catch (error) {
      toast.error("Failed to delete annotation")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <nav className="glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LayoutGrid className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold gradient-text">Image Annotation</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user?.first_name || user?.username}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Upload Images</h2>
            <p className="text-gray-400 text-sm">Upload images to annotate with polygons</p>
          </div>
          <label className="flex items-center space-x-2 px-6 py-3 gradient-bg rounded-lg text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity">
            <Upload className="w-5 h-5" />
            <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ImageGallery
                images={images}
                selectedImage={selectedImage}
                onImageSelect={handleImageSelect}
                onDelete={async (imageId) => {
                  try {
                    await api.delete(`/images/${imageId}/`)
                    setImages(images.filter((i) => i.id !== imageId))
                    if (selectedImage?.id === imageId) {
                      setSelectedImage(images.find((i) => i.id !== imageId) || null)
                    }
                    toast.success("Image deleted successfully")
                  } catch (error) {
                    toast.error("Failed to delete image")
                  }
                }}
              />
            </div>

            <div className="lg:col-span-2">
              {selectedImage && (
                <AnnotationCanvas
                  image={selectedImage}
                  annotations={annotations}
                  onSave={handleAnnotationSave}
                  onDelete={handleAnnotationDelete}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="glass rounded-xl p-12 text-center">
            <Upload className="w-16 h-16 text gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Images Yet</h3>
            <p className="text-gray-400 mb-6">Upload your first image to start annotating</p>
            <label className="inline-flex items-center space-x-2 px-6 py-3 gradient-bg rounded-lg text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity">
              <Upload className="w-5 h-5" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
