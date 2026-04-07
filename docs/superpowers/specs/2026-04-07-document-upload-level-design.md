# Document Upload for Case Creation — Design Spec

**Date:** 2026-04-07  
**Status:** Approved

## Overview

Add the ability to upload files (PDF, DOCX, PNG, JPEG) when creating or editing game cases in the admin panel. Uploaded files are stored on disk and displayed in the in-game document viewer. DOCX files are converted to PDF on upload.

## Scope

- Admin can upload files per document within a case
- Supported formats: PDF, DOCX (converted to PDF), PNG, JPEG
- Files stored on backend disk at `backend/uploads/`
- Existing text-only documents are fully backward compatible

---

## Section 1: Database & Models

### Prisma Schema Change

Add nullable `fileUrl` field to `CaseDocument`:

```prisma
model CaseDocument {
  id      String  @id
  caseId  String
  type    String
  title   String
  content String  // text content or empty string for file-based documents
  fileUrl String? // e.g. /uploads/uuid.pdf or /uploads/uuid.png
  case    Case    @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@index([caseId])
}
```

### TypeScript Model Changes

`AdminCaseDocument` and `CaseDocument` gain `fileUrl?: string`.

### Invariants

- Text documents: `fileUrl = null`, `content = non-empty string`
- File documents: `fileUrl = "/uploads/<uuid>.<ext>"`, `content = ""`
- Viewer checks `fileUrl` first; falls back to `content` if absent

---

## Section 2: Backend

### New Endpoint

```
POST /api/admin/upload
Authorization: Bearer <admin token>
Content-Type: multipart/form-data
Body: file (field name: "file")

Response 200: { fileUrl: "/uploads/<uuid>.pdf" }
Response 400: { message: "Unsupported file type" }
```

### Libraries

| Library | Purpose |
|---------|---------|
| `multer` | Parse multipart/form-data, save to `backend/uploads/` |
| `docx2pdf` or LibreOffice CLI | Convert DOCX → PDF, delete original |
| `uuid` | Generate unique filenames |

### File Processing Flow

1. `multer` saves file to `backend/uploads/<uuid>.<originalExt>`
2. If DOCX: convert to PDF → save as `<uuid>.pdf` → delete `.docx`
3. Return `{ fileUrl: "/uploads/<uuid>.pdf" }` (or `.png` / `.jpg`)

### Static File Serving

```ts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### Allowed MIME Types

- `application/pdf`
- `image/png`
- `image/jpeg`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Validation

`multer` fileFilter rejects unsupported types with 400 error.

---

## Section 3: Frontend — Admin Panel

### `adminCasesApi.ts` — New Function

```ts
export async function uploadCaseDocument(file: File): Promise<{ fileUrl: string }>
```

Uses `fetch` with `FormData` (not JSON). Includes `Authorization` header.

### `AdminCaseDocumentsField` Changes

Each document card gets an upload button next to the content field:

- **No file uploaded:** content textarea is visible (manual entry as before)
- **Upload in progress:** loading indicator, inputs disabled
- **File uploaded:** `fileUrl` stored in document state, content textarea hidden, filename shown with "Удалить файл" button

Upload fires immediately on file select (before case save). On "Удалить файл": `fileUrl` cleared, content textarea reappears.

### Form Validation Change (`validateCaseForm`)

Document is valid if `content` is non-empty **OR** `fileUrl` is set.

---

## Section 4: Frontend — Game Document Viewer

### `CaseDocumentViewer` Rendering Logic

```
if fileUrl ends with .pdf  → <iframe src={absoluteFileUrl} />
if fileUrl ends with .png/.jpg/.jpeg → <img src={absoluteFileUrl} alt={title} />
if no fileUrl → render content as text (existing behavior)
```

`absoluteFileUrl` = `BACKEND_BASE_URL + fileUrl`  
(e.g. `http://localhost:4000/uploads/uuid.pdf`)

The backend base URL (without `/api`) is derived from existing `API_BASE_URL` constant.

### `CaseDocumentList`

No changes required.

---

## Out of Scope

- OCR for images
- Cloud storage
- Text extraction from PDF/DOCX
- File deletion from disk when a case/document is deleted (can be added later)
