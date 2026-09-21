export const parseApiError = (errData, fallbackMessage = 'An error occurred') => {
  if (!errData) return fallbackMessage;

  // Handle FastAPI validation error arrays (Pydantic 422)
  if (Array.isArray(errData.detail)) {
    return errData.detail.map(err => {
      const field = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : 'Field';
      
      // Capitalize field name and replace underscores with spaces
      const formattedField = String(field)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
        
      return `${formattedField}: ${err.msg}`;
    }).join(' | ');
  }

  // Handle standard string error in detail
  if (errData.detail && typeof errData.detail === 'string') {
    return errData.detail;
  }
  
  // Handle standard string error in message
  if (errData.message && typeof errData.message === 'string') {
    return errData.message;
  }

  return fallbackMessage;
};
