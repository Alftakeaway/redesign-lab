# Redesign Lab — demo interattiva before/after

**Live**: https://redesign-lab-demo.vercel.app · **Repo**: https://github.com/Alftakeaway/redesign-lab

Demo di vendita per web designer freelance: una pagina con **tre casi prima/dopo**,
ognuno con uno slider trascinabile (mouse, touch, tastiera), la spiegazione di cosa
non funzionava e i risultati ottenuti. Chiude con un modulo di contatto via `mailto:`
e un footer minimale.

Tutto in HTML + CSS + JavaScript vanilla. **Nessun framework, nessun build step,
nessuna dipendenza, nessun backend.**

---

## Come si apre

Doppio clic su `index.html`. Funziona anche da `file://`, senza server.

Per un'anteprima più fedele (e per provare il trascinamento touch):

```powershell
cd C:\Users\Alfredo\Projects\Redesign-Lab
python -m http.server 8099
# poi apri http://localhost:8099
```

Unica cosa che richiede rete: i due font Google (Fraunces + Inter). Se sei offline
la pagina usa i fallback di sistema (`Georgia` / `Segoe UI`) e resta identica
nell'impianto.

---

## Struttura

```
Redesign-Lab/
├── index.html        # tutta la pagina: hero, metodo, 3 casi, contatti, footer
├── css/
│   └── styles.css    # token, layout, slider e i sei "screenshot" in CSS
├── js/
│   └── script.js     # slider, toggle spiegazioni, form mailto, anno footer
└── README.md
```

### Le immagini sono codice

I "prima" e i "dopo" **non sono immagini**: sono sei mini-layout ricostruiti in
HTML e CSS dentro la pagina (font Comic Sans, colori sgargianti e bottoni rilievo
per i vecchi siti; palette, tipografia e gerarchia per i redesign). Sono dentro
`index.html`, blocchi `.mock--before` e `.mock--after`, con gli stili nella
sezione 11 e 12 del CSS.

Vantaggi: nessun file immagine da perdere, zero peso, e i mock si adattano a
qualsiasi larghezza perché usano unità `cqw` (container query) — scalano come
screenshot veri.

---

## Personalizzazione rapida

| Cosa | Dove |
|---|---|
| Indirizzo email | `data-mailto` sul `<form id="contact-form">` in `index.html` — ora `alfredoforte.web@gmail.com` (e i due link mailto nella pagina) |
| Colori | `:root` in `css/styles.css` (`--ink`, `--cream`, `--amber`, `--terra`, `--paper`) |
| Font | `--font-display` / `--font-sans` in `css/styles.css` + il `<link>` Google Fonts in `index.html` |
| Casi | `<article class="case">` in `index.html`: titolo, testo, metriche, note e i due mock |
| Metriche | `<ul class="metrics">` di ogni caso |
| Testi "prima/dopo" | blocchi `.bv--1/2/3` (prima) e `.av--1/2/3` (dopo) |

### Passare da `mailto:` a Formspree

Il modulo funziona già senza backend (apre il client di posta con il messaggio
compilato). Per inviare davvero i dati a un indirizzo senza far aprire il client:

1. crea il form su `https://formspree.io/f/<tuo-id>`;
2. in `index.html` cambia `action="https://formspree.io/f/<tuo-id>"` e
   `method="POST"` sul `<form>`, togliendo `enctype="text/plain"`;
3. rimuovi l'event listener `submit` dal blocco 3 di `js/script.js`.

---

## Accessibilità

- Slider con `role="slider"`, `aria-valuemin/max/now/valuetext`, etichetta per caso.
  Frecce `←` `→` (±2%), `Pag↑` `Pag↓` (±10%), `Home`/`End` (estremità),
  `Invio`/`Spazio` (torna al centro), doppio click per riportare la maniglia a metà.
- Il contenuto visivo dei mock è `aria-hidden`: un testo equivalente descrive
  cosa mostra il "prima" e il "dopo" (`.sr-only` in ogni `<figure>`).
- `:focus-visible` con outline ambra su tutta la pagina, terracotta sullo sfondo chiaro.
- Contrasto testo verificato su WCAG AA (cream `#F4EEE4` e muted `#A2968A` su `#12100D`).
- Skip link, landmark semantici, `<figcaption>` per ogni slider, messaggi di stato
  del form con `aria-live="polite"`.
- `prefers-reduced-motion`: animazioni e transizioni ridotte al minimo.

## Compatibilità

HTML5, CSS Grid/Flexbox, custom properties, `clip-path`, `aspect-ratio`,
container query (`cqw`) e Pointer Events: **browser moderni** (Chrome/Edge/Firefox/
Safari recenti). Su browser molto vecchi la pagina resta leggibile, ma i mock
posziono non scalare in modo perfetto.

## Licenza

Codice e testi di esempio: usali pure come base per la tua demo.
I nomi dei casi sono fittizi, costruiti per mostrare il metodo.
