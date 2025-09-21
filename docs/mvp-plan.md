# MVP Phase 1

## Objective
- Allow a user to sign in to their Kavita server from the app.
- Query the OPDS catalog to explore libraries and available titles.
- Download EPUB and PDF files to the device's local storage.
- Open downloaded files in an embedded reader (EPUB and PDF).
- Sync reading progress with the Kavita server.

## Proposed Architecture
- **UI / Navigation**: Expo Router with tabs for Library, Downloads, Settings, and modal views for book details.
- **Shared state**: TanStack Query for remote data caching/fetching + Zustand for persistent state (session, downloads, preferences).
- **Network**: Axios client with interceptors for authentication (JWT) and error handling.
- **Local storage**:
  - `expo-secure-store` to save sensitive credentials (host, API key/JWT refresh).
  - `expo-file-system` for downloads and file caching.
  - `expo-sqlite` or `@react-native-async-storage/async-storage` for offline metadata (download index, local progress).
- **Reader integrations**:
  - `epubjs-rn` for ebooks.
  - `react-native-pdf` for PDFs and comics.

## Main Modules
1. **Auth** (`/features/auth`)
   - Login form (host, API key).
   - `AuthService` to exchange API Key -> JWT and refresh tokens.
   - Session persistence (secure store) and context provider.
2. **Catalog / OPDS** (`/features/catalog`)
   - OPDS client (based on `opds-feed-parser` or `r2-opds-js`).
   - Paginated lists of libraries, series, and books.
   - Search and filters (v1: basic, later iterations).
3. **Downloads** (`/features/downloads`)
   - Download queue management (priority, retries, progress).
   - File metadata stored in SQLite/AsyncStorage.
   - Integration with the reader.
4. **Reader** (`/features/reader`)
   - Shared screen that selects the renderer based on file type.
   - Shared wrapper with controls (theme, font size, fullscreen mode).
   - Progress reporting on exit or at intervals.
5. **Progress Sync** (`/features/progress`)
   - Utility hook to send progress (chapter/page position).
   - Conflict resolution: prioritize the most recent progress (local timestamp vs remote).

## End-to-End MVP Flow
1. **Start**: Login screen -> persist session -> navigate to tabs.
2. **Explore**: Library tab consumes OPDS feed -> shows list of collections/series -> book detail.
3. **Download**: Detail screen with Download button -> saves file -> marks status "Ready".
4. **Read**: Read button opens the reader (EPUB/PDF) -> stores in-app local progress.
5. **Sync**: On closing the reader or every X pages, send progress via API -> update TanStack Query cache.

## Recommended Work Roadmap
1. **Infrastructure**
   - Install dependencies (axios, tanstack-query, zustand, secure-store, file-system, sqlite, epubjs-rn, react-native-pdf, OPDS parser).
   - Configure providers (QueryClientProvider, Zustand store, Theme) in `_layout`.
2. **Authentication**
   - Create `LoginScreen`, `ServerSetupScreen` screens.
   - Implement services and secure storage.
   - Handle token expiration and retries.
3. **OPDS Catalog**
   - Implement OPDS client with basic pagination.
   - Design lists (FlatList) for libraries and books.
4. **Downloads and Storage**
   - Set up a simple queue (state in Zustand) and persistence.
   - Integrate with `expo-file-system`.
5. **Reader**
   - Create wrapper for `epubjs-rn` and `react-native-pdf`.
   - Configure basic UI (toolbar, progress).
6. **Progress Sync**
   - Implement hook to send progress to the server.
   - Handle offline queueing (save for later delivery if it fails).

## Additional Considerations
- Handle multiple profiles/servers (store list in secure store).
- Localization (i18n) from the start with `i18next` if needed.
- Testing: unit tests for services (Jest) and key screens (React Native Testing Library).
- Evaluate the use of `expo-background-fetch` for background sync (Phase 2).
