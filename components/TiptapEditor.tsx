import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlock from '@tiptap/extension-code-block';
import Color from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import Dropcursor from '@tiptap/extension-dropcursor';
import FontFamily from '@tiptap/extension-font-family';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Blockquote from '@tiptap/extension-blockquote';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import { useCallback } from 'react';
import Youtube from '@tiptap/extension-youtube';
import Gapcursor from '@tiptap/extension-gapcursor';
import Icon from '@mdi/react';
import {
  mdiFormatHeader1,
  mdiFormatHeader2,
  mdiFormatHeader3,
  mdiFormatAlignLeft,
  mdiFormatAlignCenter,
  mdiFormatAlignRight,
  mdiFormatAlignJustify,
  mdiLinkVariant,
  mdiLinkVariantOff,
  mdiFormatStrikethroughVariant,
  mdiFormatItalic,
  mdiFormatColorHighlight,
  mdiFormatBold,
  mdiCodeBraces,
  mdiCodeBlockBraces,
  mdiWaterOff,
  mdiImageArea,
  mdiYoutube,
  mdiKeyboardTabReverse,
  mdiFormatListNumbered,
  mdiFormatListBulleted,
  mdiFormatListChecks,
  mdiFormatPageBreak,
  mdiTableColumnPlusBefore,
  mdiTableColumnPlusAfter,
  mdiTableColumnRemove,
  mdiTableRowPlusBefore,
  mdiTableRowPlusAfter,
  mdiTableRowRemove,
  mdiTableLargePlus,
  mdiTableLargeRemove,
  mdiTableMergeCells,
  mdiTableSplitCell,
  mdiTableRow,
  mdiTableColumn,
  mdiArrowDownRight,
  mdiCommentQuoteOutline,
} from '@mdi/js';

export default function TipTapEditor({
  isModal,
  initialContent,
  setEditorContent,
}: any) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList,
      Blockquote,
      CharacterCount,
      CodeBlock,
      Color,
      Document,
      Gapcursor,
      Dropcursor,
      Text,
      FontFamily,
      Heading,
      Highlight,
      HorizontalRule,
      Image,
      OrderedList,
      Paragraph,
      Placeholder,
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Typography,
      Underline,
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }: any) => {
      const html = editor.getHTML();
      setEditorContent(html);
    },
  } as any);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();

      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL');

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: `100%` as any,
        height: 480,
      });
    }
  };

  const addImage = useCallback(() => {
    const url = window.prompt('Enter Image URL');
    const alt = window.prompt('Enter alt text for the image') as any;

    if (url) {
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col  w-full h-full tiptap-dev">
      <div
        className={`hidden toolbar sm:flex flex-wrap gap-2 h-fit sticky ${!isModal ? 'top-[102px]' : '-top-2'} z-40 bg-white dark:bg-[#18181b] lg:justify-center`}
      >
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded ${
            editor.isActive('blockquote') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiCommentQuoteOutline} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().insertContent('&ensp;').run()}
          className="p-2 rounded not-active"
        >
          <Icon path={mdiKeyboardTabReverse} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().setHardBreak().run()}
        >
          <Icon path={mdiArrowDownRight} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: 'left' }) ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiFormatAlignLeft} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: 'center' })
              ? 'is-active'
              : 'not-active'
          }`}
        >
          <Icon path={mdiFormatAlignCenter} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: 'right' }) ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiFormatAlignRight} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: 'justify' })
              ? 'is-active'
              : 'not-active'
          }`}
        >
          <Icon path={mdiFormatAlignJustify} size={0.8} />
        </button>
        <input
          type="color"
          className="p-2 rounded fill-current text-[#59636e]"
          onInput={(event: any) =>
            editor.chain().focus().setColor(event.target.value).run()
          }
          value={editor.getAttributes('textStyle').color}
          data-testid="setColor"
        />
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().unsetColor().run()}
          data-testid="unsetColor"
        >
          <Icon path={mdiWaterOff} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${
            editor.isActive('strike') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiFormatStrikethroughVariant} size={0.8} />
        </button>
        <button
          onClick={setLink}
          className={`p-2 rounded ${
            editor.isActive('link') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiLinkVariant} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
        >
          <Icon path={mdiLinkVariantOff} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${
            editor.isActive('italic') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiFormatItalic} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded ${
            editor.isActive('highlight') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiFormatColorHighlight} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded ${
            editor.isActive('code') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiCodeBraces} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded ${
            editor.isActive('codeBlock') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiCodeBlockBraces} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${
            editor.isActive('bold') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiFormatBold} size={0.8} />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded ${
            editor.isActive('heading', { level: 1 })
              ? 'is-active'
              : 'not-active'
          }`}
        >
          <Icon path={mdiFormatHeader1} size={0.8} />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded ${
            editor.isActive('heading', { level: 2 })
              ? 'is-active'
              : 'not-active'
          }`}
        >
          <Icon path={mdiFormatHeader2} size={0.8} />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 rounded ${
            editor.isActive('heading', { level: 3 })
              ? 'is-active'
              : 'not-active'
          }`}
        >
          <Icon path={mdiFormatHeader3} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={addImage}
        >
          <Icon path={mdiImageArea} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          id="add"
          onClick={addYoutubeVideo}
        >
          <Icon path={mdiYoutube} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${
            editor.isActive('bulletList') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiFormatListBulleted} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${
            editor.isActive('orderedList') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiFormatListNumbered} size={0.8} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-2 rounded ${
            editor.isActive('taskList') ? 'is-active' : 'not-active'
          }`}
        >
          <Icon path={mdiFormatListChecks} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Icon path={mdiFormatPageBreak} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Icon path={mdiTableLargePlus} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        >
          <Icon path={mdiTableColumnPlusBefore} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          <Icon path={mdiTableColumnPlusAfter} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          <Icon path={mdiTableColumnRemove} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().addRowBefore().run()}
        >
          <Icon path={mdiTableRowPlusBefore} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          <Icon path={mdiTableRowPlusAfter} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          <Icon path={mdiTableRowRemove} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <Icon path={mdiTableLargeRemove} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().mergeCells().run()}
        >
          <Icon path={mdiTableMergeCells} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().splitCell().run()}
        >
          <Icon path={mdiTableSplitCell} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
        >
          <Icon path={mdiTableColumn} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        >
          <Icon path={mdiTableRow} size={0.8} />
        </button>
        {/* <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Icon path={mdiArrowULeftTop} size={0.8} />
        </button>
        <button
          className="p-2 rounded fill-current text-[#59636e]"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Icon path={mdiArrowURightTop} size={0.8} />
        </button> */}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
