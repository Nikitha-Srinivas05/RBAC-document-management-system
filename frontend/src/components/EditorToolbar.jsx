export default function EditorToolbar({ editor, disabled }) {
  if (!editor) return null;

  const btn = (label, isActive, onClick) => (
    <button
      type="button"
      className={isActive ? 'is-active' : ''}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
    >
      {label}
    </button>
  );

  return (
    <div className="toolbar">
      {btn('H1', editor.isActive('heading', { level: 1 }), () =>
        editor.chain().focus().toggleHeading({ level: 1 }).run()
      )}
      {btn('H2', editor.isActive('heading', { level: 2 }), () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run()
      )}
      {btn('H3', editor.isActive('heading', { level: 3 }), () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run()
      )}
      {btn('Paragraph', editor.isActive('paragraph'), () =>
        editor.chain().focus().setParagraph().run()
      )}
      {btn('Bullet List', editor.isActive('bulletList'), () =>
        editor.chain().focus().toggleBulletList().run()
      )}
      {btn('Numbered List', editor.isActive('orderedList'), () =>
        editor.chain().focus().toggleOrderedList().run()
      )}
      {btn('Bold', editor.isActive('bold'), () =>
        editor.chain().focus().toggleBold().run()
      )}
      {btn('Italic', editor.isActive('italic'), () =>
        editor.chain().focus().toggleItalic().run()
      )}
    </div>
  );
}
