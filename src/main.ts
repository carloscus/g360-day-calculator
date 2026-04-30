import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

// Registro del Service Worker para PWA con soporte para base path
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}g360-sw.js`)
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

export default app