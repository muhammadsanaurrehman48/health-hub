import React from 'react';
import Logo from '@/assets/logo.png';

interface PrintHeaderProps {
  title?: string;
  subtitle?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ 
  title = 'Report', 
  subtitle = '' 
}) => {
  return (
    <div className="print:block hidden mb-8 border-b-2 border-gray-800 pb-6">
      {/* Header for Print */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src={Logo} alt="Smart Hospital Management System" className="w-16 h-16" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Hospital</h1>
            <p className="text-sm text-gray-700">Management System</p>
          </div>
        </div>
        <hr className="my-2 border-gray-300" />
        {title && (
          <h2 className="text-xl font-semibold text-gray-800 mt-3">{title}</h2>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Generated on: {new Date().toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
};

// Hide elements when printing
export const PrintHide: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="print:hidden">{children}</div>
);

// Show elements only when printing
export const PrintShow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="hidden print:block">{children}</div>
);

export default PrintHeader;
