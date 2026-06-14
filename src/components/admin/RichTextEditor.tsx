import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 rounded-t-2xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-primary text-white' : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
        title="Bold"
      >
        <span className="material-symbols-outlined text-[18px]">format_bold</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('italic') ? 'bg-primary text-white' : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
        title="Italic"
      >
        <span className="material-symbols-outlined text-[18px]">format_italic</span>
      </button>
      <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 my-auto mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded text-sm font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 rounded text-sm font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-white' : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
        title="Heading 3"
      >
        H3
      </button>
      <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 my-auto mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-primary text-white' : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
        title="Bullet List"
      >
        <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('orderedList') ? 'bg-primary text-white' : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
        title="Ordered List"
      >
        <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
      </button>
      <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 my-auto mx-1" />
      <button
        type="button"
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href
          const url = window.prompt('URL', previousUrl)
          
          if (url === null) return
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
          }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('link') ? 'bg-primary text-white' : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
        title="Link"
      >
        <span className="material-symbols-outlined text-[18px]">link</span>
      </button>
    </div>
  )
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-[15px]',
      },
    },
  });

  return (
    <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/50 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
      <MenuBar editor={editor} />
      <div className="max-h-[400px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
