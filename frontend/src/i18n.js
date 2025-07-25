import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "Home": "Home",
          "Knowledge Base": "Knowledge Base",
          "Analytics": "Analytics",
          "Recommendations": "Recommendations",
          "Reading Analytics": "Reading Analytics",
          "Search news...": "Search news...",
          "Your Personalized Feed": "Your Personalized Feed",
          "Ask AI": "Ask AI",
          "Comments": "Comments",
          "No comments yet. Be the first to comment!": "No comments yet. Be the first to comment!",
          "Add a comment...": "Add a comment...",
          "Post": "Post",
          "Translate": "Translate",
          "Translating...": "Translating...",
          "Translated Content": "Translated Content",
          "Hindi": "Hindi",
          "English": "English",
          "Spanish": "Spanish",
          "French": "French",
          "Chinese": "Chinese",
          "German": "German",
          "Arabic": "Arabic",
          "Add Entry": "Add Entry",
          "Edit Entry": "Edit Entry",
          "Add New Entry": "Add New Entry",
          "Topic": "Topic",
          "Notes": "Notes",
          "Cancel": "Cancel",
          "Update": "Update",
          "Save": "Save",
          // Add more keys as needed
        }
      },
      hi: {
        translation: {
          "Home": "होम",
          "Knowledge Base": "ज्ञान आधार",
          "Analytics": "विश्लेषण",
          "Recommendations": "सिफारिशें",
          "Reading Analytics": "पठन विश्लेषण",
          "Search news...": "समाचार खोजें...",
          "Your Personalized Feed": "आपकी व्यक्तिगत फ़ीड",
          "Ask AI": "एआई से पूछें",
          "Comments": "टिप्पणियाँ",
          "No comments yet. Be the first to comment!": "अभी तक कोई टिप्पणी नहीं। सबसे पहले टिप्पणी करें!",
          "Add a comment...": "टिप्पणी जोड़ें...",
          "Post": "पोस्ट करें",
          "Translate": "अनुवाद करें",
          "Translating...": "अनुवाद हो रहा है...",
          "Translated Content": "अनुवादित सामग्री",
          "Hindi": "हिंदी",
          "English": "अंग्रेज़ी",
          "Spanish": "स्पेनिश",
          "French": "फ्रेंच",
          "Chinese": "चीनी",
          "German": "जर्मन",
          "Arabic": "अरबी",
          "Add Entry": "उत्तर जोड़ें",
          "Edit Entry": "उत्तर संपादित करें",
          "Add New Entry": "नया उत्तर जोड़ें",
          "Topic": "विषय",
          "Notes": "टिप्पणियाँ",
          "Cancel": "रद्द करें",
          "Update": "अपडेट करें",
          "Save": "सहेजें",
          // Add more keys as needed
        }
      }
      // Add more languages here
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 