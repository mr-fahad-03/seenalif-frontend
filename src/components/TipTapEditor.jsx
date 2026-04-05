"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import Heading from "@tiptap/extension-heading"
import Placeholder from "@tiptap/extension-placeholder"
import { useState, useEffect, useRef } from "react"
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  LinkIcon,
  ChevronDown,
  Video as VideoIcon,
} from "lucide-react"
import ImageUpload from "./ImageUpload"
import VideoUpload from "./VideoUpload"
import { Node } from "@tiptap/core"
import { getFullImageUrl } from "../utils/imageUtils"
import "./TipTapEditor.css"

// Custom Video Extension for TipTap
const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      class: {
        default: "max-w-full h-auto rounded-lg my-4",
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "video",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", HTMLAttributes]
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})

const TipTapEditor = ({ content = "", onChange, placeholder = "Enter description..." }) => {
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showVideoUpload, setShowVideoUpload] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [editorContent, setEditorContent] = useState(content)
  const editorRef = useRef(null)

  // Create editor instance
  const editor = useEditor({
    extensions: [
      // Disable list & heading from StarterKit so we can add configured versions below
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        heading: false,
      }),
      Underline,
      // list item must be registered before list containers
      ListItem,
      BulletList,
      OrderedList,
      // Add heading explicitly to ensure heading levels are available and work with TextAlign
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Video,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left',
      }),
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setEditorContent(html)
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[200px] p-4",
      },
    },
  })

  editorRef.current = editor

  // Update editor content when content prop changes
  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content)
      if (editorRef.current) {
        editorRef.current.commands.setContent(content)
      }
    }
  }, [content])

  if (!editor) {
    return null
  }

  const handleImageUpload = (imageUrl) => {
    const fullImageUrl = getFullImageUrl(imageUrl)
    editor.chain().focus().setImage({ src: fullImageUrl }).run()
    setShowImageUpload(false)
  }

  const handleVideoUpload = (videoUrl) => {
    const fullVideoUrl = getFullImageUrl(videoUrl)
    editor.chain().focus().setVideo({ src: fullVideoUrl, controls: true }).run()
    setShowVideoUpload(false)
  }

  const insertLink = () => {
    if (linkUrl) {
      if (linkText) {
        editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run()
      } else {
        editor.chain().focus().setLink({ href: linkUrl }).run()
      }
      setShowLinkDialog(false)
      setLinkUrl("")
      setLinkText("")
    }
  }

  const headingLevels = [
    { label: "Normal Text", level: 0 },
    { label: "Heading 1", level: 1 },
    { label: "Heading 2", level: 2 },
    { label: "Heading 3", level: 3 },
    { label: "Heading 4", level: 4 },
  ]

  const setHeading = (level) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  const getCurrentHeading = () => {
    for (let i = 1; i <= 4; i++) {
      if (editor.isActive("heading", { level: i })) {
        return headingLevels.find((h) => h.level === i)?.label || "Normal Text"
      }
    }
    return "Normal Text"
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap items-center gap-2">
        {/* Heading Dropdown */}
        <div className="relative">
          <select
            value={getCurrentHeading()}
            onChange={(e) => {
              const selectedHeading = headingLevels.find((h) => h.label === e.target.value)
              if (selectedHeading) {
                setHeading(selectedHeading.level)
              }
            }}
            className="appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {headingLevels.map((heading) => (
              <option key={heading.level} value={heading.label}>
                {heading.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Format Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bold") ? "bg-gray-200 text-blue-600" : "text-gray-700"
          }`}
          title="Bold"
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("italic") ? "bg-gray-200 text-blue-600" : "text-gray-700"
          }`}
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("underline") ? "bg-gray-200 text-blue-600" : "text-gray-700"
          }`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* List Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bulletList") ? "bg-gray-200 text-blue-600" : "text-gray-700"
          }`}
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("orderedList") ? "bg-gray-200 text-blue-600" : "text-gray-700"
          }`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Alignment Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: "left" }) ? "bg-gray-200 text-blue-600" : "text-gray-700"
          }`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: "center" }) ? "bg-gray-200 text-blue-600" : "text-gray-700"
          }`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: "right" }) ? "bg-gray-200 text-blue-600" : "text-gray-700"
          }`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Media Buttons */}
        <button
          type="button"
          onClick={() => setShowImageUpload(true)}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="Insert Image"
        >
          <ImageIcon size={16} />
        </button>

        <button
          type="button"
          onClick={() => setShowVideoUpload(true)}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="Insert Video"
        >
          <VideoIcon size={16} />
        </button>

        <button
          type="button"
          onClick={() => setShowLinkDialog(true)}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="Insert Link"
        >
          <LinkIcon size={16} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[200px]">
        <EditorContent editor={editor} />
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Image (WebP only)</h3>
            <ImageUpload onImageUpload={handleImageUpload} isProduct={true} />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowImageUpload(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {showVideoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Video</h3>
            <VideoUpload onVideoUpload={handleVideoUpload} />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowVideoUpload(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text (Optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowLinkDialog(false)
                  setLinkUrl("")
                  setLinkText("")
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TipTapEditor