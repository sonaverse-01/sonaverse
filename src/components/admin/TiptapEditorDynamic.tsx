import dynamic from 'next/dynamic';
import { forwardRef } from 'react';
import type { TiptapEditorProps, TiptapEditorRef } from './TiptapEditor';

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });

const TiptapEditorDynamic = forwardRef<TiptapEditorRef, TiptapEditorProps>((props, ref) => {
  return <TiptapEditor {...props} ref={ref} />;
});

TiptapEditorDynamic.displayName = 'TiptapEditorDynamic';

export default TiptapEditorDynamic; 