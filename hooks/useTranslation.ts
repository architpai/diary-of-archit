import { useLanguage } from '@/contexts/LanguageContext';
import contentEN from '@/data/content.en.json';
import contentJP from '@/data/content.jp.json';
import uiEN from '@/data/ui/en.json';
import uiJP from '@/data/ui/jp.json';

type Content = typeof contentEN;
type UIStrings = typeof uiEN;

export function useTranslation() {
  const { language } = useLanguage();
  
  // Select content based on language
  const content: Content = language === 'ja' ? contentJP as Content : contentEN;
  const ui: UIStrings = language === 'ja' ? uiJP as UIStrings : uiEN;
  
  // Translation function for UI strings with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = ui;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
  
  return {
    content,
    t,
    language,
    isJapanese: language === 'ja'
  };
}
