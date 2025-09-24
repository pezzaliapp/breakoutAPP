
# 🎾 Breakout PWA (v6)

Reinterpretazione mobile del classico **Breakout**, installabile come PWA.  
**Novità v6:** un *mattoncino speciale* con la tua faccia: quando lo colpisci ottieni **+100 punti** e **+1 vita**.

## Come funziona il Face Brick
- In ogni livello, uno dei mattoni viene scelto casualmente come speciale.
- La sua texture è `icons/face.png` (puoi sostituirla con una tua immagine quadrata).
- Alla distruzione: +100 punti e +1 vita.

## Struttura
```
index.html
style.v6.css
app.v6.js
sw-v6.js
manifest.webmanifest
icons/
  ├─ icon-192.png
  ├─ icon-512.png
  └─ face.png   ← immagine usata per il mattoncino speciale
```

## Note
- Se aggiorni i file, i nomi versionati e `start_url?v=6` aiutano a forzare l'update su iOS.
- Controlli: *Area Touch* per muovere, tap sul canvas per pausa/continua, ↻ restart, ⛶ fullscreen.
