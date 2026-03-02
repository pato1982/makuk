import defaultContent from '../data/content.json';

const STORAGE_KEY = 'makuk_content';

export function getContent() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { ...defaultContent };
    }
  }
  return { ...defaultContent };
}

export function saveContent(content) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

export function updateSection(sectionKey, data) {
  const content = getContent();
  content[sectionKey] = data;
  saveContent(content);
  return content;
}

export function resetContent() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...defaultContent };
}

export function getDefaultContent() {
  return { ...defaultContent };
}
