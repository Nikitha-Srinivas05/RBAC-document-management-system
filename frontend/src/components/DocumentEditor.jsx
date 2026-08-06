import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import EditorToolbar from './EditorToolbar.jsx';

/**
 * DocumentEditor
 *
 * Solves the "manual formatting is painful" problem: instead of the user
 * setting font size/weight by hand for every heading (the MS Word pain
 * point), they pick a style from the toolbar (H1, H2, Bullet List, etc.)
 * and the styling is applied consistently every time, defined once in
 * index.css under `.editor-content`.
 *
 * `initialContent` / `onChange` let this be used both for creating a new
 * document and for editing an existing one - the parent page owns the
 * actual save-to-backend logic (POST/PUT to /api/documents).
 */
export default function DocumentEditor({ initialContent = '', onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Emit HTML - this is what gets sent to the backend and stored
      // as DocumentVersion.content
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div className="editor-box">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
