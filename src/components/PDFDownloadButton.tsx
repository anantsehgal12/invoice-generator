'use client';

import { useState, useRef } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';

interface PDFDownloadButtonProps {
  targetElementId: string;
  filename: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export default function PDFDownloadButton({
  targetElementId,
  filename,
  className = '',
  variant = 'primary',
  size = 'md',
  children
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      const element = document.getElementById(targetElementId);
      if (!element) {
        throw new Error('Target element not found');
      }

      await generatePDF(element, { filename });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`
        inline-flex items-center font-medium rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {children || (isGenerating ? 'Generating PDF...' : 'Download PDF')}
    </button>
  );
}