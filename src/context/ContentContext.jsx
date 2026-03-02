import { createContext, useContext, useState, useCallback } from 'react';
import { getContent, saveContent, resetContent as resetContentService } from '../services/contentService';

const ContentContext = createContext();

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => getContent());

  const updateSection = useCallback((sectionKey, data) => {
    setContent(prev => {
      const updated = { ...prev, [sectionKey]: data };
      saveContent(updated);
      return updated;
    });
  }, []);

  const resetAll = useCallback(() => {
    const fresh = resetContentService();
    setContent(fresh);
  }, []);

  return (
    <ContentContext.Provider value={{ content, updateSection, resetAll }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent debe usarse dentro de ContentProvider');
  }
  return context;
}
