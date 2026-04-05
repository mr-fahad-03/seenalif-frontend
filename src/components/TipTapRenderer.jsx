import React from 'react';
import './TipTapRenderer.css';
import './TipTapEditor.css'; // Import TipTap Editor styles for proper rendering

const TipTapRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div 
      className={`tiptap-content prose prose-base md:prose-lg lg:prose-xl max-w-none
        prose-headings:font-bold prose-headings:text-gray-900 
        prose-h1:text-2xl md:prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:mb-6 prose-h1:leading-tight
        prose-h2:text-xl md:prose-h2:text-3xl lg:prose-h2:text-4xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:leading-snug
        prose-h3:text-lg md:prose-h3:text-2xl lg:prose-h3:text-3xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:leading-snug
        prose-h4:text-base md:prose-h4:text-xl lg:prose-h4:text-2xl prose-h4:mt-6 prose-h4:mb-3
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-base md:prose-p:text-lg lg:prose-p:text-xl
        prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700
        prose-strong:text-gray-900 prose-strong:font-bold
        prose-em:text-gray-800 prose-em:italic
        prose-ul:my-6 prose-ul:space-y-2 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-6 prose-ol:space-y-2 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-700 prose-li:leading-relaxed prose-li:marker:text-blue-600
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-6
        prose-code:text-sm prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-table:w-full prose-table:border-collapse prose-table:my-8
        prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:font-semibold
        prose-td:border prose-td:border-gray-300 prose-td:p-3
        prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
        prose-video:rounded-lg prose-video:shadow-md prose-video:my-6 prose-video:max-w-full prose-video:h-auto
        first:prose-h1:mt-0 first:prose-h2:mt-0 first:prose-h3:mt-0 ${className}
        [&_video]:rounded-lg [&_video]:shadow-md [&_video]:my-6 [&_video]:max-w-full [&_video]:h-auto`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default TipTapRenderer;