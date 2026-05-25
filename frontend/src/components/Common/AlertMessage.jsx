import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  const typeClasses = {
    success: 'bg-green-50 border border-green-200',
    error: 'bg-red-50 border border-red-200',
    warning: 'bg-yellow-50 border border-yellow-200',
    info: 'bg-blue-50 border border-blue-200'
  };
  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };
  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  const Icon = type === 'success' ? FiCheckCircle :
               type === 'error' ? FiXCircle :
               type === 'warning' ? FiAlertCircle : FiInfo;

  const classes = typeClasses[type] || typeClasses.info;
  const iconClass = iconColors[type] || iconColors.info;
  const textClass = textColors[type] || textColors.info;

  return (
    <div className={`rounded-lg p-4 mb-4 border ${classes}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${textClass}`}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button 
              onClick={onClose} 
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:bg-gray-100 transition-colors"
              aria-label="Dismiss"
            >
              <FiXCircle className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;