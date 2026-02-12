'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaHeart, FaRegHeart, FaDownload, FaPlus, FaTimes, FaTrash, FaImage } from 'react-icons/fa'
import { MdCategory, MdCollections, MdPhoto } from 'react-icons/md'
import { callAIAgent } from '@/lib/aiAgent'

// Theme variables - Sunset theme
const THEME_VARS = {
  '--background': '30 40% 98%',
  '--foreground': '20 40% 10%',
  '--card': '30 40% 96%',
  '--card-foreground': '20 40% 10%',
  '--primary': '24 95% 53%',
  '--primary-foreground': '0 0% 100%',
  '--accent': '12 80% 50%',
  '--accent-foreground': '0 0% 100%',
  '--border': '30 35% 88%',
  '--muted': '30 30% 90%',
  '--muted-foreground': '20 30% 40%',
} as React.CSSProperties

// TypeScript interfaces
interface GhibliImage {
  id: string
  imageUrl: string
  title: string
  enhanced_prompt: string
  category: 'Temples' | 'Countryside' | 'Cities' | 'Coastal' | 'Other'
  generatedAt: string
  isFavorite?: boolean
  collectionIds?: string[]
}

interface Collection {
  id: string
  name: string
  description?: string
  imageIds: string[]
  createdAt: string
}

interface DownloadRecord {
  id: string
  imageId: string
  imageUrl: string
  title: string
  downloadedAt: string
}

type Screen = 'gallery' | 'generate' | 'collections' | 'downloads'
type Category = 'All' | 'Temples' | 'Countryside' | 'Cities' | 'Coastal' | 'Other'

const AGENT_ID = '698e1604b7f596d9c48de34d'

// Helper function to generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Sample data for demonstration
function getSampleImages(): GhibliImage[] {
  return [
    {
      id: 'sample-1',
      imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
      title: 'Ancient Temple in Bamboo Forest',
      enhanced_prompt: 'A serene ancient Japanese temple nestled within a lush bamboo forest, soft golden light filtering through the leaves, peaceful atmosphere with floating cherry blossoms, Studio Ghibli style, warm color palette, dreamlike quality',
      category: 'Temples',
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      isFavorite: true,
    },
    {
      id: 'sample-2',
      imageUrl: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800',
      title: 'Coastal Village at Sunset',
      enhanced_prompt: 'A quaint Japanese coastal village bathed in warm sunset hues, fishing boats gently swaying in the harbor, traditional wooden houses with curved roofs, seagulls soaring overhead, Studio Ghibli aesthetic, vibrant oranges and purples',
      category: 'Coastal',
      generatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'sample-3',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      title: 'Rice Fields and Farmhouse',
      enhanced_prompt: 'Terraced rice fields stretching across rolling hills, a traditional farmhouse with thatched roof, morning mist rising from the paddies, distant mountains silhouetted against a pastel sky, Studio Ghibli style, peaceful countryside scene',
      category: 'Countryside',
      generatedAt: new Date(Date.now() - 259200000).toISOString(),
      isFavorite: true,
    },
    {
      id: 'sample-4',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      title: 'Tokyo Street in Rain',
      enhanced_prompt: 'A bustling Tokyo street scene in gentle rain, neon signs reflecting on wet pavement, people with colorful umbrellas, vending machines glowing warmly, Studio Ghibli atmosphere, blend of modern and traditional elements',
      category: 'Cities',
      generatedAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
      id: 'sample-5',
      imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800',
      title: 'Mountain Shrine Path',
      enhanced_prompt: 'A winding stone path leading to a mountaintop shrine, red torii gates ascending through misty forest, lanterns softly glowing, autumn leaves scattered on steps, Studio Ghibli magical realism, warm and inviting atmosphere',
      category: 'Temples',
      generatedAt: new Date(Date.now() - 432000000).toISOString(),
    },
  ]
}

function ImageCard({ image, onFavorite, onDownload, onViewDetails }: {
  image: GhibliImage
  onFavorite: (id: string) => void
  onDownload: (image: GhibliImage) => void
  onViewDetails: (image: GhibliImage) => void
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className="group relative overflow-hidden rounded-[0.875rem] cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      style={{
        background: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
      onClick={() => onViewDetails(image)}
    >
      <div className="relative aspect-[4/3] bg-muted/30">
        <Image
          src={image.imageUrl}
          alt={image.title}
          fill
          className={`object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-serif font-semibold text-lg mb-2" style={{ letterSpacing: '-0.01em' }}>
              {image.title}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFavorite(image.id)
                }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                {image.isFavorite ? (
                  <FaHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <FaRegHeart className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload(image)
                }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <FaDownload className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category badge */}
      <div className="absolute top-3 right-3">
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-foreground border border-border">
          {image.category}
        </span>
      </div>
    </div>
  )
}

function GalleryScreen({
  images,
  onFavorite,
  onDownload,
  onNavigate,
  onViewDetails
}: {
  images: GhibliImage[]
  onFavorite: (id: string) => void
  onDownload: (image: GhibliImage) => void
  onNavigate: (screen: Screen) => void
  onViewDetails: (image: GhibliImage) => void
}) {
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const categories: Category[] = ['All', 'Temples', 'Countryside', 'Cities', 'Coastal', 'Other']

  const filteredImages = activeCategory === 'All'
    ? images
    : images.filter(img => img.category === activeCategory)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg border-b border-border" style={{ background: 'rgba(250, 247, 242, 0.75)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-serif font-bold mb-6" style={{ letterSpacing: '-0.01em', color: 'hsl(20 40% 10%)' }}>
            Gallery
          </h1>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeCategory === cat
                    ? 'text-white shadow-lg'
                    : 'bg-card hover:bg-muted border border-border'
                }`}
                style={activeCategory === cat ? {
                  background: 'hsl(24 95% 53%)',
                } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'hsl(30 30% 90%)' }}>
              <FaImage className="w-10 h-10" style={{ color: 'hsl(20 30% 40%)' }} />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2" style={{ color: 'hsl(20 40% 10%)' }}>
              No images yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Generate your first Ghibli-style artwork to get started
            </p>
            <button
              onClick={() => onNavigate('generate')}
              className="px-6 py-3 rounded-[0.875rem] text-white font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{ background: 'hsl(24 95% 53%)' }}
            >
              <FaPlus className="w-4 h-4" />
              Generate Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map(image => (
              <ImageCard
                key={image.id}
                image={image}
                onFavorite={onFavorite}
                onDownload={onDownload}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating generate button */}
      {images.length > 0 && (
        <button
          onClick={() => onNavigate('generate')}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
          style={{ background: 'hsl(24 95% 53%)' }}
        >
          <FaPlus className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

function GenerateScreen({
  onImageGenerated,
  onNavigate
}: {
  onImageGenerated: (image: GhibliImage) => void
  onNavigate: (screen: Screen) => void
}) {
  const [prompt, setPrompt] = useState('')
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('Temples')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GhibliImage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const categories: Array<Exclude<Category, 'All'>> = ['Temples', 'Countryside', 'Cities', 'Coastal', 'Other']

  const handleGenerate = async () => {
    console.log('Generate button clicked')
    console.log('Prompt:', prompt)
    console.log('Category:', category)

    if (!prompt.trim()) {
      setError('Please enter a description')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      console.log('Calling AI Agent with:', { prompt, AGENT_ID })
      const result = await callAIAgent(
        prompt,
        AGENT_ID,
        { session_id: `ghibli-session-${Date.now()}` }
      )
      console.log('AI Agent result:', result)

      // Extract image URL from module_outputs (top-level)
      console.log('Module outputs:', result?.module_outputs)
      const imageUrl = Array.isArray(result?.module_outputs?.artifact_files) && result.module_outputs.artifact_files.length > 0
        ? result.module_outputs.artifact_files[0]?.file_url
        : null
      console.log('Extracted image URL:', imageUrl)

      // Extract metadata from result.response.result
      const metadata = result?.response?.result
      console.log('Metadata:', metadata)
      const title = metadata?.title ?? 'Untitled'
      const enhanced_prompt = metadata?.enhanced_prompt ?? prompt
      const responseCategory = metadata?.category ?? category

      if (!imageUrl) {
        console.error('No image URL found in result')
        throw new Error('No image was generated')
      }

      const newImage: GhibliImage = {
        id: generateId(),
        imageUrl,
        title,
        enhanced_prompt,
        category: responseCategory,
        generatedAt: new Date().toISOString(),
        isFavorite: false,
      }

      setGeneratedImage(newImage)
    } catch (err) {
      console.error('Error generating image:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage)
      setPrompt('')
      setGeneratedImage(null)
      onNavigate('gallery')
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${generatedImage.title.replace(/\s+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download image')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8" style={{ letterSpacing: '-0.01em', color: 'hsl(20 40% 10%)' }}>
          Generate Artwork
        </h1>

        {/* Input card */}
        <div
          className="rounded-[0.875rem] p-8 mb-8 backdrop-blur-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 35%, hsl(40 40% 96%) 70%, hsl(15 35% 97%) 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(20 40% 10%)' }}>
              Describe your Japanese scene
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., ancient shrine in bamboo forest at sunset, coastal village with fishing boats, mountain temple in autumn..."
              rows={4}
              className="w-full px-4 py-3 rounded-[0.875rem] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none font-sans"
              style={{ lineHeight: '1.55' }}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(20 40% 10%)' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Exclude<Category, 'All'>)}
              className="w-full px-4 py-3 rounded-[0.875rem] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-[0.875rem] bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-6 py-3 rounded-[0.875rem] text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'hsl(24 95% 53%)' }}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FaImage className="w-5 h-5" />
                Generate Image
              </>
            )}
          </button>
        </div>

        {/* Preview area */}
        {generatedImage && (
          <div
            className="rounded-[0.875rem] p-8 backdrop-blur-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 35%, hsl(40 40% 96%) 70%, hsl(15 35% 97%) 100%)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <h2 className="text-xl font-serif font-semibold mb-6" style={{ letterSpacing: '-0.01em', color: 'hsl(20 40% 10%)' }}>
              Generated Artwork
            </h2>

            <div className="relative aspect-[4/3] rounded-[0.875rem] overflow-hidden mb-6">
              <Image
                src={generatedImage.imageUrl}
                alt={generatedImage.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-serif font-semibold mb-2" style={{ color: 'hsl(20 40% 10%)' }}>
                {generatedImage.title}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-foreground">
                  {generatedImage.category}
                </span>
              </div>
              <div className="p-4 rounded-[0.875rem] bg-background/50 border border-border">
                <p className="text-sm font-medium mb-2" style={{ color: 'hsl(20 30% 40%)' }}>
                  Enhanced Prompt:
                </p>
                <p className="text-sm" style={{ color: 'hsl(20 40% 10%)', lineHeight: '1.55' }}>
                  {generatedImage.enhanced_prompt}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 rounded-[0.875rem] text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
                style={{ background: 'hsl(24 95% 53%)' }}
              >
                <FaHeart className="w-5 h-5" />
                Save to Gallery
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-[0.875rem] font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:bg-muted border border-border bg-card"
              >
                <FaDownload className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CollectionsScreen({
  images,
  collections,
  onCreateCollection,
  onDeleteCollection,
  onAddToCollection,
  onRemoveFromCollection
}: {
  images: GhibliImage[]
  collections: Collection[]
  onCreateCollection: (name: string, description?: string) => void
  onDeleteCollection: (id: string) => void
  onAddToCollection: (collectionId: string, imageId: string) => void
  onRemoveFromCollection: (collectionId: string, imageId: string) => void
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDesc, setNewCollectionDesc] = useState('')
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null)

  const handleCreate = () => {
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName, newCollectionDesc || undefined)
      setNewCollectionName('')
      setNewCollectionDesc('')
      setShowCreateModal(false)
    }
  }

  const getCollectionImages = (collection: Collection): GhibliImage[] => {
    return images.filter(img => collection.imageIds.includes(img.id))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold" style={{ letterSpacing: '-0.01em', color: 'hsl(20 40% 10%)' }}>
            Collections
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-[0.875rem] text-white font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
            style={{ background: 'hsl(24 95% 53%)' }}
          >
            <FaPlus className="w-4 h-4" />
            New Collection
          </button>
        </div>

        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'hsl(30 30% 90%)' }}>
              <MdCollections className="w-10 h-10" style={{ color: 'hsl(20 30% 40%)' }} />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2" style={{ color: 'hsl(20 40% 10%)' }}>
              No collections yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create collections to organize your favorite artwork
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-[0.875rem] text-white font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
              style={{ background: 'hsl(24 95% 53%)' }}
            >
              <FaPlus className="w-4 h-4" />
              Create Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(collection => {
              const collectionImages = getCollectionImages(collection)
              const isExpanded = expandedCollection === collection.id

              return (
                <div
                  key={collection.id}
                  className="rounded-[0.875rem] p-6 backdrop-blur-lg transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 100%)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-serif font-semibold mb-1" style={{ color: 'hsl(20 40% 10%)' }}>
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground">{collection.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteCollection(collection.id)}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                      <FaTrash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm text-muted-foreground">
                      {collectionImages.length} {collectionImages.length === 1 ? 'image' : 'images'}
                    </span>
                  </div>

                  {collectionImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {collectionImages.slice(0, 3).map(img => (
                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={img.imageUrl}
                            alt={img.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedCollection(isExpanded ? null : collection.id)}
                    className="w-full px-4 py-2 rounded-[0.875rem] font-medium text-sm transition-all duration-200 border border-border hover:bg-muted"
                  >
                    {isExpanded ? 'Hide Images' : 'View All'}
                  </button>

                  {isExpanded && collectionImages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      {collectionImages.map(img => (
                        <div key={img.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={img.imageUrl}
                              alt={img.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{img.title}</p>
                            <p className="text-xs text-muted-foreground">{img.category}</p>
                          </div>
                          <button
                            onClick={() => onRemoveFromCollection(collection.id, img.id)}
                            className="p-1.5 rounded hover:bg-red-100 transition-colors"
                          >
                            <FaTimes className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Create collection modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-md rounded-[0.875rem] p-8 backdrop-blur-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 100%)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-semibold" style={{ color: 'hsl(20 40% 10%)' }}>
                  New Collection
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewCollectionName('')
                    setNewCollectionDesc('')
                  }}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(20 40% 10%)' }}>
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., My Favorites"
                  className="w-full px-4 py-3 rounded-[0.875rem] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(20 40% 10%)' }}>
                  Description (optional)
                </label>
                <textarea
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-[0.875rem] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={!newCollectionName.trim()}
                className="w-full px-6 py-3 rounded-[0.875rem] text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'hsl(24 95% 53%)' }}
              >
                Create Collection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DownloadsScreen({
  downloads,
  onClearHistory
}: {
  downloads: DownloadRecord[]
  onClearHistory: () => void
}) {
  const handleRedownload = async (record: DownloadRecord) => {
    try {
      const response = await fetch(record.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${record.title.replace(/\s+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold" style={{ letterSpacing: '-0.01em', color: 'hsl(20 40% 10%)' }}>
            Downloads
          </h1>
          {downloads.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-6 py-3 rounded-[0.875rem] font-medium flex items-center gap-2 transition-all duration-200 hover:bg-red-50 border border-red-200 text-red-600"
            >
              <FaTrash className="w-4 h-4" />
              Clear History
            </button>
          )}
        </div>

        {downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'hsl(30 30% 90%)' }}>
              <FaDownload className="w-10 h-10" style={{ color: 'hsl(20 30% 40%)' }} />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2" style={{ color: 'hsl(20 40% 10%)' }}>
              No downloads yet
            </h3>
            <p className="text-muted-foreground">
              Downloaded images will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map(record => (
              <div
                key={record.id}
                className="rounded-[0.875rem] p-6 backdrop-blur-lg flex items-center gap-6"
                style={{
                  background: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 100%)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={record.imageUrl}
                    alt={record.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-serif font-semibold mb-1" style={{ color: 'hsl(20 40% 10%)' }}>
                    {record.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Downloaded {new Date(record.downloadedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <button
                  onClick={() => handleRedownload(record)}
                  className="px-4 py-2 rounded-[0.875rem] font-medium text-sm flex items-center gap-2 transition-all duration-200 border border-border hover:bg-muted"
                >
                  <FaDownload className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<Screen>('gallery')
  const [images, setImages] = useState<GhibliImage[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [downloads, setDownloads] = useState<DownloadRecord[]>([])
  const [useSampleData, setUseSampleData] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GhibliImage | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedImages = localStorage.getItem('ghibli_images')
      const storedCollections = localStorage.getItem('ghibli_collections')
      const storedDownloads = localStorage.getItem('ghibli_downloads')

      if (storedImages) {
        try {
          setImages(JSON.parse(storedImages))
        } catch (e) {
          console.error('Failed to parse images:', e)
        }
      }

      if (storedCollections) {
        try {
          setCollections(JSON.parse(storedCollections))
        } catch (e) {
          console.error('Failed to parse collections:', e)
        }
      }

      if (storedDownloads) {
        try {
          setDownloads(JSON.parse(storedDownloads))
        } catch (e) {
          console.error('Failed to parse downloads:', e)
        }
      }

      setIsInitialized(true)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('ghibli_images', JSON.stringify(images))
    }
  }, [images, isInitialized])

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('ghibli_collections', JSON.stringify(collections))
    }
  }, [collections, isInitialized])

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('ghibli_downloads', JSON.stringify(downloads))
    }
  }, [downloads, isInitialized])

  const displayImages = useSampleData ? getSampleImages() : images
  const sortedImages = [...displayImages].sort((a, b) =>
    new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  )

  const handleFavorite = (id: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
    ))
  }

  const handleDownload = async (image: GhibliImage) => {
    try {
      const response = await fetch(image.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${image.title.replace(/\s+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Add to download history
      const downloadRecord: DownloadRecord = {
        id: generateId(),
        imageId: image.id,
        imageUrl: image.imageUrl,
        title: image.title,
        downloadedAt: new Date().toISOString(),
      }
      setDownloads(prev => [downloadRecord, ...prev])
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const handleImageGenerated = (image: GhibliImage) => {
    setImages(prev => [image, ...prev])
  }

  const handleCreateCollection = (name: string, description?: string) => {
    const newCollection: Collection = {
      id: generateId(),
      name,
      description,
      imageIds: [],
      createdAt: new Date().toISOString(),
    }
    setCollections(prev => [...prev, newCollection])
  }

  const handleDeleteCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  const handleAddToCollection = (collectionId: string, imageId: string) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, imageIds: [...c.imageIds, imageId] }
        : c
    ))
  }

  const handleRemoveFromCollection = (collectionId: string, imageId: string) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, imageIds: c.imageIds.filter(id => id !== imageId) }
        : c
    ))
  }

  const handleClearDownloads = () => {
    setDownloads([])
  }

  const navItems = [
    { screen: 'gallery' as Screen, icon: MdPhoto, label: 'Gallery' },
    { screen: 'generate' as Screen, icon: FaPlus, label: 'Generate' },
    { screen: 'collections' as Screen, icon: MdCollections, label: 'Collections' },
    { screen: 'downloads' as Screen, icon: FaDownload, label: 'Downloads' },
  ]

  return (
    <div style={THEME_VARS} className="min-h-screen bg-background text-foreground font-sans">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div
          className="w-64 border-r border-border flex-shrink-0 flex flex-col backdrop-blur-lg"
          style={{ background: 'rgba(250, 247, 242, 0.75)' }}
        >
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-serif font-bold" style={{ letterSpacing: '-0.01em', color: 'hsl(20 40% 10%)' }}>
              Ghibli Gallery
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Studio Ghibli-style artwork
            </p>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeScreen === item.screen

                return (
                  <button
                    key={item.screen}
                    onClick={() => setActiveScreen(item.screen)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[0.875rem] font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'hover:bg-muted'
                    }`}
                    style={isActive ? {
                      background: 'hsl(24 95% 53%)',
                    } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Sample data toggle */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between p-3 rounded-[0.875rem] bg-card">
              <span className="text-sm font-medium">Sample Data</span>
              <button
                onClick={() => setUseSampleData(!useSampleData)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  useSampleData ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    useSampleData ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Agent info */}
          <div className="p-4 border-t border-border">
            <div className="p-3 rounded-[0.875rem] bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium">Agent Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ghibli Image Generator
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeScreen === 'gallery' && (
            <GalleryScreen
              images={sortedImages}
              onFavorite={handleFavorite}
              onDownload={handleDownload}
              onNavigate={setActiveScreen}
              onViewDetails={setSelectedImage}
            />
          )}

          {activeScreen === 'generate' && (
            <GenerateScreen
              onImageGenerated={handleImageGenerated}
              onNavigate={setActiveScreen}
            />
          )}

          {activeScreen === 'collections' && (
            <CollectionsScreen
              images={images}
              collections={collections}
              onCreateCollection={handleCreateCollection}
              onDeleteCollection={handleDeleteCollection}
              onAddToCollection={handleAddToCollection}
              onRemoveFromCollection={handleRemoveFromCollection}
            />
          )}

          {activeScreen === 'downloads' && (
            <DownloadsScreen
              downloads={downloads}
              onClearHistory={handleClearDownloads}
            />
          )}
        </div>
      </div>

      {/* Image detail modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-4xl w-full rounded-[0.875rem] p-8 backdrop-blur-lg max-h-[90vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 35%, hsl(40 40% 96%) 70%, hsl(15 35% 97%) 100%)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold mb-2" style={{ letterSpacing: '-0.01em', color: 'hsl(20 40% 10%)' }}>
                  {selectedImage.title}
                </h2>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-foreground">
                  {selectedImage.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="relative aspect-[4/3] rounded-[0.875rem] overflow-hidden mb-6">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2" style={{ color: 'hsl(20 30% 40%)' }}>
                Enhanced Prompt:
              </h3>
              <p className="text-sm p-4 rounded-[0.875rem] bg-background/50 border border-border" style={{ lineHeight: '1.55' }}>
                {selectedImage.enhanced_prompt}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleFavorite(selectedImage.id)}
                className="flex-1 px-6 py-3 rounded-[0.875rem] font-medium flex items-center justify-center gap-2 transition-all duration-200 border border-border hover:bg-muted"
              >
                {selectedImage.isFavorite ? (
                  <>
                    <FaHeart className="w-5 h-5 text-red-500" />
                    Favorited
                  </>
                ) : (
                  <>
                    <FaRegHeart className="w-5 h-5" />
                    Add to Favorites
                  </>
                )}
              </button>
              <button
                onClick={() => handleDownload(selectedImage)}
                className="px-6 py-3 rounded-[0.875rem] text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
                style={{ background: 'hsl(24 95% 53%)' }}
              >
                <FaDownload className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
