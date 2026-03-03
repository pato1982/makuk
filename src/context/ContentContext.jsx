import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchContent as fetchContentApi, saveSection } from '../services/api';
import defaultContent from '../data/content.json';

const ContentContext = createContext();

export function ContentProvider({ children }) {
  const [content, setContent] = useState({ ...defaultContent });
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    // Limpiar sistema viejo de localStorage
    localStorage.removeItem('makuk_content');

    fetchContentApi()
      .then(data => setContent(data))
      .catch(err => {
        console.error('Error cargando contenido desde API:', err);
        // Mantiene defaultContent como fallback para desarrollo local
      })
      .finally(() => setContentLoading(false));
  }, []);

  const updateSection = useCallback(async (sectionKey, data) => {
    // Actualización optimista del state local
    setContent(prev => ({ ...prev, [sectionKey]: data }));
    // Persistir en el backend (los errores suben al caller para mostrar feedback)
    await saveSection(sectionKey, data);
  }, []);

  const reloadContent = useCallback(async () => {
    try {
      const data = await fetchContentApi();
      setContent(data);
    } catch (err) {
      console.error('Error recargando contenido:', err);
    }
  }, []);

  return (
    <ContentContext.Provider value={{ content, updateSection, reloadContent, contentLoading }}>
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
