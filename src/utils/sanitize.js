import DOMPurify from 'dompurify';

/**
 * Sanitizes input strings to prevent XSS.
 * @param {string} dirty 
 * @returns {string} clean HTML/text
 */
export const sanitize = (dirty) => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] }); // Strip all tags to be safe
};
