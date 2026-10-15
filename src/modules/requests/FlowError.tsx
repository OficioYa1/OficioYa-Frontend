import React from 'react';
import { AlertCircle } from 'lucide-react';

/** Mensaje de error junto al campo; el campo lo enlaza con aria-describedby. */
export const FlowError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} className="oy-flow-error">
      <AlertCircle size={14} aria-hidden="true" />
      {message}
    </p>
  ) : null;
