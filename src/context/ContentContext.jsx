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
    // Guardar estado anterior para rollback si falla
    const previous = content[sectionKey];
    // Actualización optimista del state local
    setContent(prev => ({ ...prev, [sectionKey]: data }));
    try {
      // Persistir en el backend
      await saveSection(sectionKey, data);
    } catch (err) {
      // Rollback: restaurar estado anterior si el guardado falló
      setContent(prev => ({ ...prev, [sectionKey]: previous }));
      throw err; // re-lanzar para que el caller muestre feedback
    }
  }, [content]);

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
