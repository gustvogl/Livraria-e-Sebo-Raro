import React from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/rajdhani/latin-500.css';
import '@fontsource/rajdhani/latin-600.css';
import '@fontsource/rajdhani/latin-700.css';
import LivrariaRaraApp from './LivrariaRaraApp.jsx';
import './styles.css';

async function iniciarAplicativo() {
  if (!Capacitor.isNativePlatform()) {
    // Registra a câmera web; no APK a captura usa a interface nativa do Android.
    await defineCustomElements(window);
  }
  createRoot(document.getElementById('root')).render(<LivrariaRaraApp />);
}
iniciarAplicativo();
