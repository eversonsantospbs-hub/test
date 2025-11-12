"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Carregando..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600 font-medium">{message}</p>
        <p className="text-sm text-gray-500">Conectando com a nuvem...</p>
      </div>
    </div>
  );
}