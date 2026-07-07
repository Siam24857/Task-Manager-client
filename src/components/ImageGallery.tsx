"use client"

import { motion } from "framer-motion"
import { Trash2, Image as ImageIcon } from "lucide-react"
import { Image as ImageType } from "@/types"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: ImageType[]
  selectedImage: ImageType | null
  onImageSelect: (image: ImageType) => void
  onDelete: (imageId: number) => void
}

export default function ImageGallery({ images, selectedImage, onImageSelect, onDelete }: ImageGalleryProps) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Image Gallery</h3>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {images.map((image) => (
          <motion.div
            key={image.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => onImageSelect(image)}
            className={cn(
              "relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
              selectedImage?.id === image.id
                ? "border-purple-500 ring-2 ring-purple-500/50"
                : "border-transparent hover:border-white/20"
            )}
          >
            <img
              src={image.image_url}
              alt={image.title}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-white text-sm font-medium truncate">{image.title}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(image.id)
              }}
              className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
