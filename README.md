
# 🎾 Breakout PWA — v10.3

![Icona principale](icons/face.png)

Una reinterpretazione **moderna e mobile-friendly** del classico **Breakout** (Atari, 1976).  
Giocabile direttamente da browser o installabile come **Progressive Web App (PWA)** su iOS/Android.

> Nota: l’icona in testata è la **faccia** usata nel *Face Brick* speciale. L’icona dell’app PWA resta quella con la **B** stilizzata.

---

## 🚀 Caratteristiche principali
- **Controlli touch ottimizzati**: muovi la racchetta trascinando il dito nella fascia grigia *Area Touch*.
- **HUD completo**: punteggio, vite, livello e record personale (`localStorage`).
- **Face Brick speciale** 🎭: un mattone casuale con la tua immagine che si rompe al primo colpo e assegna **+100 punti** e **+1 LIFE**, con popup visivo e flash.
- **Progressione dinamica**: velocità della palla che cresce con i livelli.
- **Installabile offline**: manifest + service worker con cache versionata.
- **Compatibile desktop**: tastiera (`← →` muovi, `Spazio` pausa, `R` restart, `F` fullscreen).

---

## 🖼️ Icone
| Ruolo | Anteprima |
|------|-----------|
| **Icona App PWA** | ![App Icon](icons/icon-512.png) |
| **Face Brick** | ![Face Brick](icons/face.png) |

---

## 📂 Struttura del progetto
```
breakout_v10_2/
├── index.html
├── style.v10.css
├── app.v10.js
├── sw-v10-1.js
├── manifest.webmanifest
├── README.md
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-1024.png
    └── face.png
```

---

## ▶️ Come giocare
1. Apri la pagina pubblicata (GitHub Pages o server).
2. **Muovi la racchetta**: trascina il dito nell’*Area Touch*.
3. **Pausa/Continua**: tap sul canvas o pulsante ⏸/▶︎.
4. **Restart**: pulsante ↻ o tasto `R`.
5. **Fullscreen**: pulsante ⛶ o tasto `F`.

---

## 📲 Installazione su smartphone
- **iOS (Safari)**: *Condividi → Aggiungi alla schermata Home*.
- **Android (Chrome)**: *Aggiungi a Home screen*.
- Dopo il primo caricamento la PWA funziona anche **offline**.

---

## 🛠️ Sviluppo
- Codice in **vanilla JS**, nessuna libreria esterna.
- HTML, CSS, JS, manifest e service worker totalmente locali.
- Licenza **MIT**.

---

## 📜 Licenza
© 2025 pezzaliAPP — Open Source (MIT).  
Ispirato all’originale **Breakout (Atari, 1976)**.


**Novità v10.3**: fix bonus del Face Brick (+100, +1 LIFE garantito), popups aggiornati, icone PWA ufficiali con la tua faccia.
