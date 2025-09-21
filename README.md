# 📚 kavita-reader-rn

An open-source mobile reader for [Kavita](https://www.kavitareader.com), built with **React Native**.  
Connects via **OPDS** and the **Kavita API** to browse, download, and read books (**EPUB/PDF/Comics**) on Android/iOS, with reading progress sync and offline support.  

---

## ✨ Features (Planned)

### 📖 Reader (EPUB / PDF / Manga & Comics)
- [ ] **Bookmarks** at page/chapter level.
- [ ] **Translator integration** (DeepL/Google Translate).
- [ ] **Customize reading experience**: font family, font size, margins, line spacing.
- [ ] **Chapter navigation**: jump between chapters easily.
- [ ] **Text selection**:  
  - Copy to clipboard  
  - Highlight in multiple colors  
  - Underline  
  - Add notes/comments  
  - Search the selected text inside the book  
  - Look up in **Wiktionary/Wikipedia**  
  - Translate text  
- [ ] **Text-to-Speech (TTS)**:  
  - Adjustable speed  
  - Sleep timer  

### 📚 Library Management
- [ ] **Library view modes**: list or tile grid.  
- [ ] **Filtering & sorting**: author, publisher, series, tags.  
- [ ] **Collections**: create custom collections (e.g. “Terror”, “Sci-Fi”, “Favorites”).  
- [ ] **Reading lists**:  
  - *Want to Read*  
  - *Currently Reading*  
  - *Finished*  
- [ ] **Reviews**: star rating + comments per book.  
- [ ] **Multiple libraries**: separate spaces for Books, Comics, Manga.  
- [ ] **Author view**: browse/filter by authors and related works.  

---

## 🔗 Integration

### With **Kavita**
- ✅ Use **OPDS** for browsing and fetching metadata.  
- ✅ Use **Kavita API** for:  
  - Authentication (API Key → JWT)  
  - Reading progress sync  
  - Collections/reading lists (where available)  
  - Reviews (if supported in future by Kavita API)  

### From **Readest (inspiration)**
- Reader UX: highlights, annotations, translations.  
- Advanced search inside EPUB.  
- Text-to-Speech integration.  

---

## 🛠️ Tech Stack
- **Runtime & UI**: Expo 54 (React Native 0.81 / React 19), Expo Router, React Navigation, Expo vector icons.  
- **Data & State**: TanStack React Query for network caching, Zustand for persistent session + download queue, React Context for theming.  
- **Filesystem & Device APIs**: `expo-file-system`, `expo-sharing`, `expo-secure-store`, `expo-haptics`, `expo-image`, `expo-web-browser`.  
- **Rendering**: `react-native-pdf` for PDFs & comics, future `epubjs-rn` integration for EPUB (planned).  
- **Networking & Parsing**: Fetch + custom Kavita client, `fast-xml-parser` for OPDS feeds.  
- **Tooling**: TypeScript, ESLint (expo config), metro bundler via Expo CLI.  

### 🔌 Kavita Connectivity
- **Authentication**: Username/password login against `/api/Account/login`, optional API key storage with Secure Store.
- **Catalog**: OPDS navigation via `/api/opds/{apiKey}` and link resolution to nested feeds or acquisition links.
- **Downloads**: OPDS acquisition links → `expo-file-system` downloads into app sandbox with resumable support.
- **Progress Sync** *(planned)*: POST reading checkpoints back to Kavita REST endpoints and refresh TanStack Query caches.

---

## 🚀 Using the App Today

### Sign In
1. **Host**: enter the base URL of your Kavita server (e.g. `http://192.168.1.18:5000`). If you paste a full OPDS link, the app automatically trims everything after `/api/opds`.
2. **Username & password**: your regular Kavita credentials. They are sent to `/api/Account/login` to authenticate and obtain the JWT tokens.
3. **API Key (optional)**:
   - If your server returns an `apiKey` in the login response, it is saved automatically and you can leave this field blank.
   - If you run a Kavita version that **does not** return an `apiKey`, enter it here or later in Settings; it is required to consume the OPDS feed.

### Browse the OPDS catalog
- Once signed in with an API key available, the app loads **Your Library** from `/api/opds/{apiKey}`.
- Cards list subsections and acquisition links. Navigation links open additional feeds; acquisition links let you download EPUB/PDF/CBZ files.
- Downloads are stored in the app's private storage for offline reading.

> The current MVP covers authentication, OPDS browsing, and content downloads. Items marked as pending in the Features section are still in development.

---

## 📌 Roadmap
1. **MVP**: Login to Kavita → browse OPDS → download EPUB/PDF → open in reader → sync progress.  
2. **Reader upgrades**: highlights, annotations, dictionary, TTS.  
3. **Library upgrades**: collections, reviews, multi-library view.  

---

## 🤝 Contributing
Contributions are welcome!  
- Open an issue for feature requests or bugs.  
- Submit PRs for improvements.  
- Discuss design ideas in the Issues/Discussions section.  

---

## 📜 License
Licensed under **MIT License** – free to use, modify, and distribute.  

---
