# Document Upload for Case Creation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admins to upload PDF, DOCX (auto-converted to PDF), PNG, and JPEG files as documents when creating or editing a game case; files are stored on disk and rendered in the in-game document viewer.

**Architecture:** A new `POST /api/admin/upload` endpoint accepts a file via multipart/form-data, saves it to `backend/uploads/`, converts DOCX to PDF via LibreOffice, and returns `{ fileUrl }`. The `fileUrl` is stored as a nullable field on `CaseDocument` in Postgres. The frontend admin UI uploads files immediately on select and stores `fileUrl` in form state; the game viewer checks `fileUrl` and renders `<iframe>` or `<img>` accordingly.

**Tech Stack:** multer (multipart), uuid (unique filenames), libreoffice-convert (DOCX→PDF), Prisma migration, React state, native `fetch` with FormData

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `backend/prisma/schema.prisma` | Modify | Add `fileUrl String?` to `CaseDocument` |
| `backend/prisma/migrations/…` | Created by migrate | SQL for the new column |
| `backend/src/validators/game-case.schemas.ts` | Modify | Make `content` allow empty string; add optional `fileUrl` with refinement |
| `backend/src/services/admin-case.service.ts` | Modify | Pass `fileUrl` through in create/update |
| `backend/uploads/.gitkeep` | Create | Ensures uploads dir is tracked |
| `backend/src/middleware/upload.middleware.ts` | Create | Multer configuration + DOCX conversion helper |
| `backend/src/controllers/upload.controller.ts` | Create | `POST /admin/upload` handler |
| `backend/src/routes/admin.routes.ts` | Modify | Register upload route |
| `backend/src/app.ts` | Modify | Serve `/uploads` as static |
| `src/models/admin-case.ts` | Modify | Add `fileUrl?: string` to `AdminCaseDocument` |
| `src/models/document.ts` | Modify | Add `fileUrl?: string` to `CaseDocument` |
| `src/features/admin-cases/adminCasesApi.ts` | Modify | Add `uploadCaseDocument(file)` |
| `src/components/admin/AdminCaseDocumentsField.tsx` | Modify | Upload button per document, loading state, preview |
| `src/components/admin/AdminCaseEditor.tsx` | Modify | Include `fileUrl` in payload; update validation |
| `src/components/case/CaseDocumentViewer.tsx` | Modify | Render `<iframe>` / `<img>` when `fileUrl` present |

---

## Task 1: Add `fileUrl` to Prisma schema and run migration

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Edit schema.prisma — add `fileUrl` to `CaseDocument`**

Replace the `CaseDocument` model:

```prisma
model CaseDocument {
  id      String  @id
  caseId  String
  type    String
  title   String
  content String
  fileUrl String?
  case    Case    @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@index([caseId])
}
```

- [ ] **Step 2: Run the migration**

```bash
cd backend
npx prisma migrate dev --name add-file-url-to-case-document
```

Expected output:
```
The following migration(s) have been created and applied from new schema changes:
migrations/
  └─ 20260407…_add_file_url_to_case_document/
    └─ migration.sql
```

- [ ] **Step 3: Verify Prisma client was regenerated**

```bash
npx prisma generate
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 4: Commit**

```bash
cd ..
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat(db): add fileUrl to CaseDocument"
```

---

## Task 2: Install backend dependencies

**Files:** `backend/package.json` (modified by npm)

- [ ] **Step 1: Install runtime packages**

```bash
cd backend
npm install multer uuid libreoffice-convert
```

- [ ] **Step 2: Install type packages**

```bash
npm install --save-dev @types/multer @types/uuid
```

- [ ] **Step 3: Create a minimal type declaration for libreoffice-convert**

LibreOffice-convert has no bundled types. Create `backend/src/types/libreoffice-convert.d.ts`:

```typescript
declare module 'libreoffice-convert' {
  function convert(
    buffer: Buffer,
    format: string,
    filter: string | undefined,
    callback: (err: Error | null, result: Buffer) => void,
  ): void;
  export = { convert };
}
```

- [ ] **Step 4: Create uploads directory**

```bash
mkdir -p uploads
echo "" > uploads/.gitkeep
```

- [ ] **Step 5: Add uploads to .gitignore (keep directory, ignore contents)**

Add to `backend/.gitignore` (create if missing):

```
uploads/*
!uploads/.gitkeep
```

- [ ] **Step 6: Commit**

```bash
cd ..
git add backend/package.json backend/package-lock.json backend/src/types/libreoffice-convert.d.ts backend/uploads/.gitkeep
git commit -m "feat(backend): install multer, uuid, libreoffice-convert for file upload"
```

---

## Task 3: Create upload middleware (multer config + DOCX converter)

**Files:**
- Create: `backend/src/middleware/upload.middleware.ts`

- [ ] **Step 1: Create the file**

```typescript
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

import multer from 'multer';
import libreOffice from 'libreoffice-convert';

const libreConvert = promisify(libreOffice.convert);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const uploadSingle = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
}).single('file');

/**
 * Converts a DOCX file on disk to PDF using LibreOffice.
 * Deletes the original .docx file and returns the path to the .pdf file.
 */
export async function convertDocxToPdf(docxPath: string): Promise<string> {
  const pdfPath = docxPath.replace(/\.docx$/i, '.pdf');
  const inputBuffer = fs.readFileSync(docxPath);
  const pdfBuffer = await libreConvert(inputBuffer, '.pdf', undefined);
  fs.writeFileSync(pdfPath, pdfBuffer);
  fs.unlinkSync(docxPath);
  return pdfPath;
}
```

- [ ] **Step 2: Build to check for TypeScript errors**

```bash
cd backend
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd ..
git add backend/src/middleware/upload.middleware.ts
git commit -m "feat(backend): add multer upload middleware and DOCX-to-PDF converter"
```

---

## Task 4: Create upload controller and register route

**Files:**
- Create: `backend/src/controllers/upload.controller.ts`
- Modify: `backend/src/routes/admin.routes.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Create the upload controller**

Create `backend/src/controllers/upload.controller.ts`:

```typescript
import path from 'path';
import type { NextFunction, Request, Response } from 'express';

import { UPLOADS_DIR, convertDocxToPdf, uploadSingle } from '../middleware/upload.middleware.js';

export function handleUpload(request: Request, response: Response, next: NextFunction): void {
  uploadSingle(request, response, async (err) => {
    if (err) {
      response.status(400).json({ message: err instanceof Error ? err.message : 'Upload failed' });
      return;
    }

    if (!request.file) {
      response.status(400).json({ message: 'No file provided' });
      return;
    }

    try {
      let filePath = request.file.path;

      // Convert DOCX to PDF
      if (request.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        filePath = await convertDocxToPdf(filePath);
      }

      const filename = path.basename(filePath);
      response.status(200).json({ fileUrl: `/uploads/${filename}` });
    } catch (conversionError) {
      response.status(500).json({
        message: conversionError instanceof Error ? conversionError.message : 'File conversion failed',
      });
    }
  });
}
```

- [ ] **Step 2: Register upload route in admin.routes.ts**

Add the import and route. The full file should be:

```typescript
import { Router } from 'express';
import { UserRole } from '@prisma/client';

import {
  createCase,
  deleteCase,
  getAdminCase,
  getAdminCases,
  updateCase,
} from '../controllers/admin.controller.js';
import { handleUpload } from '../controllers/upload.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorizeRole } from '../middleware/authorize-role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createGameCaseRequestSchema,
  gameCaseIdParamsSchema,
  updateGameCaseRequestSchema,
} from '../validators/game-case.schemas.js';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(authorizeRole(UserRole.ADMIN));

adminRouter.post('/upload', handleUpload);

adminRouter.get('/cases', asyncHandler(getAdminCases));
adminRouter.get('/cases/:id', validateRequest(gameCaseIdParamsSchema), asyncHandler(getAdminCase));
adminRouter.post('/cases', validateRequest(createGameCaseRequestSchema), asyncHandler(createCase));
adminRouter.patch('/cases/:id', validateRequest(updateGameCaseRequestSchema), asyncHandler(updateCase));
adminRouter.delete('/cases/:id', validateRequest(gameCaseIdParamsSchema), asyncHandler(deleteCase));
```

- [ ] **Step 3: Serve uploads as static files in app.ts**

Add static serving. The full `app.ts`:

```typescript
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { UPLOADS_DIR } from './middleware/upload.middleware.js';
import { apiRouter } from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/', (_request, response) => {
  response.json({
    message: 'Backend server is running. Use /health or /api/* endpoints.',
  });
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/favicon.ico', (_request, response) => {
  response.status(204).end();
});

app.use('/api', apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
```

- [ ] **Step 4: Build to check for TypeScript errors**

```bash
cd backend
npm run build
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd ..
git add backend/src/controllers/upload.controller.ts backend/src/routes/admin.routes.ts backend/src/app.ts
git commit -m "feat(backend): add POST /api/admin/upload endpoint and static file serving"
```

---

## Task 5: Update backend validator and case service to handle fileUrl

**Files:**
- Modify: `backend/src/validators/game-case.schemas.ts`
- Modify: `backend/src/services/admin-case.service.ts`

- [ ] **Step 1: Update document schema to support fileUrl**

Replace `documentSchema` in `backend/src/validators/game-case.schemas.ts`. Full file:

```typescript
import { z } from 'zod';

const decisionSchema = z.enum(['approve', 'reject', 'rework', 'extra-review']);

const documentSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    title: z.string().min(1),
    content: z.string(),
    fileUrl: z.string().optional(),
  })
  .refine((doc) => doc.content.length > 0 || (doc.fileUrl !== undefined && doc.fileUrl.length > 0), {
    message: 'Document must have either content or fileUrl',
  });

const issueSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
});

export const gameCasePayloadSchema = z.object({
  id: z.string().min(1),
  level: z.number().int().min(1),
  title: z.string().min(1),
  productName: z.string().min(1),
  productVersion: z.string().min(1),
  productType: z.string().min(1),
  productDescription: z.string().min(1),
  documents: z.array(documentSchema),
  issues: z.array(issueSchema),
  correctDecision: decisionSchema,
  explanation: z.string().min(1),
  topics: z.array(z.string().min(1)),
});

export const createGameCaseRequestSchema = z.object({
  body: gameCasePayloadSchema,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

export const updateGameCaseRequestSchema = z.object({
  body: gameCasePayloadSchema.omit({ id: true }).partial(),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).default({}),
});

export const gameCaseIdParamsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).default({}),
});

export type CreateGameCaseInput = z.infer<typeof gameCasePayloadSchema>;
export type UpdateGameCaseInput = z.infer<typeof updateGameCaseRequestSchema>['body'];
```

- [ ] **Step 2: Update admin-case.service.ts to pass fileUrl through**

Replace the full file `backend/src/services/admin-case.service.ts`:

```typescript
import { prisma } from '../config/prisma.js';
import { toApiDecisionType, toPrismaDecisionType } from '../lib/decision-mapper.js';
import type { CreateGameCaseInput, UpdateGameCaseInput } from '../validators/game-case.schemas.js';

const caseDelegate = prisma['case'];

type AdminCaseRecord = {
  id: string;
  level: number;
  title: string;
  productName: string;
  productVersion: string;
  productType: string;
  productDescription: string;
  correctDecision: Parameters<typeof toApiDecisionType>[0];
  explanation: string;
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
  documents: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    fileUrl: string | null;
  }>;
  issues: Array<{
    id: string;
    type: string;
    description: string;
  }>;
};

function mapGameCase(record: NonNullable<AdminCaseRecord>) {
  return {
    id: record.id,
    level: record.level,
    title: record.title,
    productName: record.productName,
    productVersion: record.productVersion,
    productType: record.productType,
    productDescription: record.productDescription,
    documents: record.documents.map((doc) => ({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      content: doc.content,
      fileUrl: doc.fileUrl ?? undefined,
    })),
    issues: record.issues,
    correctDecision: toApiDecisionType(record.correctDecision),
    explanation: record.explanation,
    topics: record.topics,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildUpdateData(input: UpdateGameCaseInput) {
  const data: Record<string, unknown> = {};

  if (input.level !== undefined) data.level = input.level;
  if (input.title !== undefined) data.title = input.title;
  if (input.productName !== undefined) data.productName = input.productName;
  if (input.productVersion !== undefined) data.productVersion = input.productVersion;
  if (input.productType !== undefined) data.productType = input.productType;
  if (input.productDescription !== undefined) data.productDescription = input.productDescription;
  if (input.documents !== undefined) {
    data.documents = {
      deleteMany: {},
      create: input.documents.map((document) => ({
        id: document.id,
        type: document.type,
        title: document.title,
        content: document.content,
        fileUrl: document.fileUrl ?? null,
      })),
    };
  }
  if (input.issues !== undefined) {
    data.issues = {
      deleteMany: {},
      create: input.issues.map((issue) => ({
        id: issue.id,
        type: issue.type,
        description: issue.description,
      })),
    };
  }
  if (input.correctDecision !== undefined) {
    data.correctDecision = toPrismaDecisionType(input.correctDecision);
  }
  if (input.explanation !== undefined) data.explanation = input.explanation;
  if (input.topics !== undefined) data.topics = input.topics;

  return data;
}

export async function getAdminCasesList() {
  const cases = await caseDelegate.findMany({
    include: {
      documents: true,
      issues: true,
    },
    orderBy: [{ level: 'asc' }, { id: 'asc' }],
  });

  return cases.map((gameCase) => mapGameCase(gameCase));
}

export async function getAdminCaseById(id: string) {
  const gameCase = await caseDelegate.findUnique({
    where: { id },
    include: {
      documents: true,
      issues: true,
    },
  });

  if (!gameCase) {
    return null;
  }

  return mapGameCase(gameCase);
}

export async function createAdminCase(input: CreateGameCaseInput) {
  const createdCase = await caseDelegate.create({
    data: {
      id: input.id,
      level: input.level,
      title: input.title,
      productName: input.productName,
      productVersion: input.productVersion,
      productType: input.productType,
      productDescription: input.productDescription,
      correctDecision: toPrismaDecisionType(input.correctDecision),
      explanation: input.explanation,
      topics: input.topics,
      documents: {
        create: input.documents.map((document) => ({
          id: document.id,
          type: document.type,
          title: document.title,
          content: document.content,
          fileUrl: document.fileUrl ?? null,
        })),
      },
      issues: {
        create: input.issues.map((issue) => ({
          id: issue.id,
          type: issue.type,
          description: issue.description,
        })),
      },
    },
    include: {
      documents: true,
      issues: true,
    },
  });

  return mapGameCase(createdCase);
}

export async function updateAdminCase(id: string, input: UpdateGameCaseInput) {
  const existingCase = await caseDelegate.findUnique({
    where: { id },
  });

  if (!existingCase) {
    return null;
  }

  const updatedCase = await caseDelegate.update({
    where: { id },
    data: buildUpdateData(input),
    include: {
      documents: true,
      issues: true,
    },
  });

  return mapGameCase(updatedCase);
}

export async function deleteAdminCase(id: string) {
  const existingCase = await caseDelegate.findUnique({
    where: { id },
  });

  if (!existingCase) {
    return null;
  }

  await caseDelegate.delete({
    where: { id },
  });

  return {
    id,
    deleted: true,
  };
}
```

- [ ] **Step 3: Build**

```bash
cd backend
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd ..
git add backend/src/validators/game-case.schemas.ts backend/src/services/admin-case.service.ts
git commit -m "feat(backend): support fileUrl in case document validation and service"
```

---

## Task 6: Update frontend TypeScript models

**Files:**
- Modify: `src/models/admin-case.ts`
- Modify: `src/models/document.ts`

- [ ] **Step 1: Add fileUrl to AdminCaseDocument**

Replace `src/models/admin-case.ts`:

```typescript
export type AdminCaseDocument = {
  id: string;
  type: string;
  title: string;
  content: string;
  fileUrl?: string;
};

export type AdminCaseIssue = {
  id: string;
  type: string;
  description: string;
};

export type AdminCase = {
  id: string;
  level: number;
  title: string;
  productName: string;
  productVersion: string;
  productType: string;
  productDescription: string;
  documents: AdminCaseDocument[];
  issues: AdminCaseIssue[];
  correctDecision: 'approve' | 'reject' | 'rework' | 'extra-review';
  explanation: string;
  topics: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type AdminCasePayload = Omit<AdminCase, 'createdAt' | 'updatedAt'>;
```

- [ ] **Step 2: Add fileUrl to CaseDocument**

Replace `src/models/document.ts`:

```typescript
export const documentTypes = [
  'спецификация требований',
  'тест-план',
  'отчет о тестировании',
  'журнал дефектов',
  'сертификат соответствия',
  'акт проверки',
  'сведения о версии продукта',
] as const;

export type DocumentType = (typeof documentTypes)[number];

export type DocumentSection = {
  id: string;
  title: string;
  content: string;
};

export type CaseDocument = {
  id: string;
  type: DocumentType;
  title: string;
  summary: string;
  sections: DocumentSection[];
  fileUrl?: string;
};
```

- [ ] **Step 3: Check for TypeScript errors in frontend**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/models/admin-case.ts src/models/document.ts
git commit -m "feat(models): add fileUrl to AdminCaseDocument and CaseDocument"
```

---

## Task 7: Add uploadCaseDocument to adminCasesApi

**Files:**
- Modify: `src/features/admin-cases/adminCasesApi.ts`

- [ ] **Step 1: Add the upload function**

Replace `src/features/admin-cases/adminCasesApi.ts`:

```typescript
import { getStoredAccessToken } from '../auth/authStorage';
import type { AdminCase } from '../../models/admin-case';
import { API_BASE_URL, requestJson } from '../api/apiClient';

type DeleteCaseResponse = {
  id: string;
  deleted: boolean;
};

export async function fetchAdminCases(): Promise<AdminCase[]> {
  return requestJson<AdminCase[]>('/admin/cases');
}

export async function fetchAdminCaseById(caseId: string): Promise<AdminCase> {
  return requestJson<AdminCase>(`/admin/cases/${caseId}`);
}

export async function createAdminCase(payload: AdminCase): Promise<AdminCase> {
  return requestJson<AdminCase>('/admin/cases', {
    method: 'POST',
    body: payload,
  });
}

export async function updateAdminCase(caseId: string, payload: Partial<AdminCase>): Promise<AdminCase> {
  return requestJson<AdminCase>(`/admin/cases/${caseId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteAdminCase(caseId: string): Promise<DeleteCaseResponse> {
  return requestJson<DeleteCaseResponse>(`/admin/cases/${caseId}`, {
    method: 'DELETE',
  });
}

export async function uploadCaseDocument(file: File): Promise<{ fileUrl: string }> {
  const token = getStoredAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    throw new Error('Не удалось подключиться к серверу. Проверьте, что backend запущен на localhost:4000.');
  }

  if (!response.ok) {
    let message = 'Upload failed';
    try {
      const payload = (await response.json()) as { message?: string };
      message = payload.message ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return (await response.json()) as { fileUrl: string };
}
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/admin-cases/adminCasesApi.ts
git commit -m "feat(api): add uploadCaseDocument function"
```

---

## Task 8: Update AdminCaseDocumentsField with upload UI

**Files:**
- Modify: `src/components/admin/AdminCaseDocumentsField.tsx`
- Modify: `src/components/admin/AdminCaseEditor.tsx`

- [ ] **Step 1: Rewrite AdminCaseDocumentsField**

Replace `src/components/admin/AdminCaseDocumentsField.tsx`:

```tsx
import { useRef, useState } from 'react';

import { uploadCaseDocument } from '../../features/admin-cases/adminCasesApi';
import type { AdminCaseDocument } from '../../models/admin-case';

type AdminCaseDocumentsFieldProps = {
  documents: AdminCaseDocument[];
  onChange: (documents: AdminCaseDocument[]) => void;
};

function createEmptyDocument(): AdminCaseDocument {
  return {
    id: '',
    type: '',
    title: '',
    content: '',
  };
}

export function AdminCaseDocumentsField({
  documents,
  onChange,
}: AdminCaseDocumentsFieldProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function handleDocumentChange(
    index: number,
    field: keyof AdminCaseDocument,
    value: string,
  ) {
    onChange(
      documents.map((document, documentIndex) =>
        documentIndex === index
          ? { ...document, [field]: value }
          : document,
      ),
    );
  }

  function handleAddDocument() {
    onChange([...documents, createEmptyDocument()]);
  }

  function handleRemoveDocument(index: number) {
    onChange(documents.filter((_, documentIndex) => documentIndex !== index));
  }

  function handleRemoveFile(index: number) {
    onChange(
      documents.map((document, documentIndex) =>
        documentIndex === index
          ? { ...document, fileUrl: undefined, content: '' }
          : document,
      ),
    );
  }

  async function handleFileChange(index: number, file: File | undefined) {
    if (!file) return;

    setUploadingIndex(index);
    setUploadErrors((previous) => ({ ...previous, [index]: '' }));

    try {
      const { fileUrl } = await uploadCaseDocument(file);
      onChange(
        documents.map((document, documentIndex) =>
          documentIndex === index
            ? { ...document, fileUrl, content: '' }
            : document,
        ),
      );
    } catch (error) {
      setUploadErrors((previous) => ({
        ...previous,
        [index]: error instanceof Error ? error.message : 'Ошибка загрузки файла',
      }));
    } finally {
      setUploadingIndex(null);
      // Reset file input
      const input = fileInputRefs.current[index];
      if (input) input.value = '';
    }
  }

  return (
    <section className="stack-layout">
      <div className="panel-card-header">
        <p className="page-label">Документы</p>
        <h4>Состав кейса</h4>
      </div>

      {documents.length === 0 ? (
        <p className="page-description">Документы пока не добавлены.</p>
      ) : (
        <div className="stack-layout">
          {documents.map((document, index) => (
            <article key={`${document.id}-${index}`} className="form-section-card">
              <div className="form-grid">
                <label className="form-field">
                  <span>ID документа</span>
                  <input
                    value={document.id}
                    onChange={(event) =>
                      handleDocumentChange(index, 'id', event.target.value)
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Тип</span>
                  <input
                    value={document.type}
                    onChange={(event) =>
                      handleDocumentChange(index, 'type', event.target.value)
                    }
                  />
                </label>
                <label className="form-field form-field-wide">
                  <span>Название</span>
                  <input
                    value={document.title}
                    onChange={(event) =>
                      handleDocumentChange(index, 'title', event.target.value)
                    }
                  />
                </label>

                {document.fileUrl ? (
                  <div className="form-field form-field-wide">
                    <span className="form-field-label">Файл загружен</span>
                    <div className="uploaded-file-preview">
                      <span className="uploaded-file-name">
                        {document.fileUrl.split('/').pop()}
                      </span>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Удалить файл
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="form-field form-field-wide">
                      <span>Содержимое</span>
                      <textarea
                        rows={5}
                        value={document.content}
                        onChange={(event) =>
                          handleDocumentChange(index, 'content', event.target.value)
                        }
                      />
                    </label>
                    <div className="form-field form-field-wide">
                      <span className="form-field-label">Или загрузить файл (PDF, DOCX, PNG, JPG)</span>
                      <div className="page-actions">
                        <input
                          ref={(element) => { fileInputRefs.current[index] = element; }}
                          type="file"
                          accept=".pdf,.docx,.png,.jpg,.jpeg"
                          style={{ display: 'none' }}
                          onChange={(event) =>
                            void handleFileChange(index, event.target.files?.[0])
                          }
                        />
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={uploadingIndex === index}
                          onClick={() => fileInputRefs.current[index]?.click()}
                        >
                          {uploadingIndex === index ? 'Загрузка...' : 'Загрузить файл'}
                        </button>
                      </div>
                      {uploadErrors[index] ? (
                        <p className="form-error-text">{uploadErrors[index]}</p>
                      ) : null}
                    </div>
                  </>
                )}
              </div>

              <div className="page-actions">
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleRemoveDocument(index)}
                >
                  Удалить документ
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="page-actions">
        <button type="button" className="secondary-button" onClick={handleAddDocument}>
          Добавить документ
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update form validation and payload in AdminCaseEditor.tsx**

In `src/components/admin/AdminCaseEditor.tsx`, find the `validateCaseForm` function and replace the document content check:

Old (line 73-75):
```typescript
  if (state.documents.some((document) => !document.id.trim() || !document.type.trim() || !document.title.trim() || !document.content.trim())) {
    return 'У каждого документа должны быть заполнены id, тип, название и содержимое.';
  }
```

New:
```typescript
  if (state.documents.some((document) => {
    const hasContent = document.content.trim().length > 0;
    const hasFile = (document.fileUrl ?? '').length > 0;
    return !document.id.trim() || !document.type.trim() || !document.title.trim() || (!hasContent && !hasFile);
  })) {
    return 'У каждого документа должны быть заполнены id, тип, название и содержимое (или загружен файл).';
  }
```

Also in `handleSubmit`, the documents map (lines 123-128) must include `fileUrl`:

Old:
```typescript
      documents: state.documents.map((document) => ({
        id: document.id.trim(),
        type: document.type.trim(),
        title: document.title.trim(),
        content: document.content.trim(),
      })),
```

New:
```typescript
      documents: state.documents.map((document) => ({
        id: document.id.trim(),
        type: document.type.trim(),
        title: document.title.trim(),
        content: document.content.trim(),
        fileUrl: document.fileUrl,
      })),
```

- [ ] **Step 3: Check for TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminCaseDocumentsField.tsx src/components/admin/AdminCaseEditor.tsx
git commit -m "feat(admin): add file upload to document editor with preview and error handling"
```

---

## Task 9: Update CaseDocumentViewer to render files

**Files:**
- Modify: `src/components/case/CaseDocumentViewer.tsx`

- [ ] **Step 1: Add a helper to build the absolute file URL**

The `fileUrl` stored in DB is `/uploads/filename.pdf`. The game needs the full URL: `http://localhost:4000/uploads/filename.pdf`. Derive the backend base URL from `API_BASE_URL` (which is `http://localhost:4000/api`) by removing the `/api` suffix.

- [ ] **Step 2: Rewrite CaseDocumentViewer**

Replace `src/components/case/CaseDocumentViewer.tsx`:

```tsx
import { API_BASE_URL } from '../../features/api/apiClient';
import type { CaseDocument } from '../../models/document';

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

type CaseDocumentViewerProps = {
  document: CaseDocument | undefined;
};

function getFileType(fileUrl: string): 'pdf' | 'image' {
  const lower = fileUrl.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'image';
}

function FileViewer({ fileUrl, title }: { fileUrl: string; title: string }) {
  const absoluteUrl = `${BACKEND_BASE_URL}${fileUrl}`;
  const fileType = getFileType(fileUrl);

  if (fileType === 'pdf') {
    return (
      <iframe
        src={absoluteUrl}
        title={title}
        className="document-file-iframe"
        style={{ width: '100%', height: '600px', border: 'none' }}
      />
    );
  }

  return (
    <img
      src={absoluteUrl}
      alt={title}
      className="document-file-image"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}

export function CaseDocumentViewer({ document }: CaseDocumentViewerProps) {
  if (!document) {
    return (
      <section className="panel-card case-document-viewer">
        <div className="panel-card-header">
          <p className="page-label">Просмотр документа</p>
          <h3>Документ не выбран</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-card case-document-viewer">
      <div className="panel-card-header">
        <p className="page-label">Просмотр документа</p>
        <h3>{document.title}</h3>
      </div>

      <div className="document-viewer-meta">
        <span className="document-viewer-badge">{document.type}</span>
        {!document.fileUrl && (
          <span className="document-viewer-badge">{document.sections.length} секций</span>
        )}
      </div>

      {document.fileUrl ? (
        <FileViewer fileUrl={document.fileUrl} title={document.title} />
      ) : (
        <>
          <p className="case-document-summary">{document.summary}</p>
          <div className="document-section-list">
            {document.sections.map((section) => (
              <article key={section.id} className="document-section-card">
                <h4>{section.title}</h4>
                <p>{section.content}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Check for TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/case/CaseDocumentViewer.tsx
git commit -m "feat(viewer): render PDF and image files in CaseDocumentViewer"
```

---

## Task 10: Smoke test end-to-end

- [ ] **Step 1: Start the backend**

```bash
cd backend && npm run dev
```

Expected: server running on port 4000, no errors in console.

- [ ] **Step 2: Start the frontend**

```bash
npm run dev
```

Expected: Vite dev server running, no TypeScript errors.

- [ ] **Step 3: Test file upload as admin**

1. Log in as admin at `http://localhost:5173`
2. Go to Admin page → Create new case
3. Add a document → click "Загрузить файл"
4. Select a PDF file
5. Expected: button shows "Загрузка...", then "Файл загружен" preview appears
6. Verify file appears in `backend/uploads/`

- [ ] **Step 4: Test DOCX conversion**

1. Upload a `.docx` file as a document
2. Expected: `backend/uploads/` contains a `.pdf` file (no `.docx`)
3. The `fileUrl` in form state ends with `.pdf`

- [ ] **Step 5: Test image upload**

1. Upload a `.png` file
2. Expected: file stored, `fileUrl` ends with `.png`

- [ ] **Step 6: Test save and reload**

1. Fill all required fields, save the case
2. Edit the same case
3. Expected: document shows "Файл загружен" with correct filename

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "chore: smoke test passed — document upload feature complete"
```

---

## Notes

- **LibreOffice required:** DOCX→PDF conversion requires LibreOffice installed on the machine running the backend. Install from https://www.libreoffice.org/download/. Without it, DOCX uploads will fail with a conversion error.
- **File cleanup:** Uploaded files are not deleted when a case/document is deleted from the DB. This is out of scope and can be added later.
- **Game loads static JSON:** The game currently loads cases from `src/data/cases/index.ts` (static JSON files), not from the API. The `CaseDocumentViewer` changes will apply when the game is migrated to load from the API, or when static JSON files include a `fileUrl` field.
