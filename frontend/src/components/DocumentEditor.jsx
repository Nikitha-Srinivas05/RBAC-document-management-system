import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import EditorToolbar from './EditorToolbar.jsx';

/**
 * DocumentEditor
 *
 * `initialContent` loads once the parent has fetched it from the API
 * (async), so we sync it into the editor via useEffect once it arrives.
 * `editable` is driven by the user's role - Viewers see the content but
 * can't type into it, enforced here in the UI (the backend middleware is
 * the real enforcement; this is just to avoid a confusing UX where a
 * Viewer can type but the save silently fails).
 */
export default function DocumentEditor({ initialContent = '', onChange, editable = true }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent, editor]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  return (
    <div className="editor-box">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
