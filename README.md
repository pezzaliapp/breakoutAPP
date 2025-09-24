
# 🎾 Breakout PWA

Una reinterpretazione mobile-friendly del classico **Breakout** (Atari, 1976).  
Giocabile direttamente da browser o installabile come **Progressive Web App (PWA)** su iOS/Android.

![screenshot](icons/icon-512.png)

---

## 🚀 Caratteristiche
- **Controlli touch ottimizzati**: trascina il dito nella fascia grigia con scritto *Area Touch* per muovere la racchetta.
- **Adatto agli smartphone**: paddle posizionato in alto rispetto alla fascia touch per non coprirlo con il dito.
- **HUD completo**: punteggio, vite, livello e best score (salvato in `localStorage`).
- **Progressione dinamica**: velocità della palla cresce con i livelli.
- **Installabile offline**: manifest + service worker (`cache-first`).
- **Compatibile desktop**: controlli con tastiera (← → per muovere, `Spazio` pausa, `R` restart, `F` fullscreen).

---

## 📂 Struttura del progetto

breakout_v5/
├── index.html
├── style.v5.css
├── app.v5.js
├── sw-v5.js
├── manifest.webmanifest
└── icons/
├── icon-192.png
└── icon-512.png

---

## ▶️ Come giocare
1. Apri la pagina pubblicata (GitHub Pages o altro server).
2. **Muovi la racchetta**: trascina il dito nell’area grigia *Area Touch*.
3. **Pausa/Continua**: tocca il canvas di gioco oppure usa il pulsante ⏸/▶︎.
4. **Restart**: pulsante ↻ o tasto `R`.
5. **Fullscreen**: pulsante ⛶ o tasto `F`.

---

## 📲 Installazione su smartphone
- Su iOS (Safari): apri il sito, poi *Condividi → Aggiungi alla schermata Home*.
- Su Android (Chrome): apri il sito, poi *Aggiungi a Home screen*.
- La PWA funziona anche **offline** dopo il primo caricamento.

---

## 🛠️ Sviluppo
- Codice in **vanilla JS**, nessuna libreria esterna.
- Tutto in locale: HTML, CSS, JS, manifest e service worker.
- Licenza MIT → libero da usare, modificare e condividere.

---

## 📜 Licenza
© 2025 pezzaliAPP — Open Source (MIT).  
Ispirato all’originale **Breakout (Atari, 1976)**.
