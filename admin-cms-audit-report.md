# Admin Panel CMS Audit Report

## 1. Logic and Functionality Analysis

The Admin CMS section provides a way to edit copy and media across the storefront. It utilizes Next.js Server Components, Client Components, Server Actions, and API routes.

**Core Workflow:**
- **Read:** `src/app/(admin)/admin/cms/page.tsx` fetches `CMSContent` records from the SQLite database via Prisma (`orderBy: { section: "asc" }`). It groups these records by section and passes them to the `CMSManagement` Client Component.
- **Update (Text/Content):** The `CMSManagement` component provides inputs/textareas to modify values. When "Save Changes" is clicked, it calls the `updateCMSContent` Server Action from `src/app/(admin)/admin/actions.ts`.
- **Upload (Media):** For fields containing `_img`, `_video`, `_poster`, or `_url`, `CMSManagement` displays an upload button. Clicking this triggers a `POST` request to `/api/admin/upload`, which saves the file to the `public/uploads` directory and returns a local URL. The user then must click "Save Changes" to update the CMS content record with the new URL.

**Key Observations:**
- The architecture correctly separates data fetching (Server Components) from interactivity (Client Components).
- Server Actions (`updateCMSContent`) and API Routes (`/api/admin/upload`, `/api/admin/cms/route.ts`) are properly guarded by authentication mechanisms.
- Caching is managed using Next.js `revalidatePath` to ensure updated content appears immediately on the frontend (`/` and `/admin/cms`).

## 2. Identified Vulnerabilities

### A. Local File Upload System (`/api/admin/upload/route.ts`)
- **Issue:** The application uses the local file system (`public/uploads`) for media storage. This approach is highly problematic in serverless environments like Vercel, where the filesystem is ephemeral. Uploaded files will vanish when the serverless function spins down or during new deployments.
- **Impact:** High. Any uploaded images or videos will result in broken links shortly after uploading in a production environment.
- **Solution:** Migrate the upload logic to a dedicated cloud storage service, such as AWS S3, Cloudinary, Vercel Blob, or Supabase Storage. The API should handle direct uploads to the cloud and store the returned CDN URL in the database.

### B. Upload File Type and Extension Handling
- **Issue:** The upload API checks `file.type` against `allowedMimeTypes`. However, mime types sent from the client can be easily spoofed. Furthermore, it extracts the extension using `path.extname(file.name)` and relies on `Buffer.from(await file.arrayBuffer())` to write the file.
- **Impact:** Medium to High. While the current file extension extraction and cleanup (`cleanName`) limit some risks, relying solely on client-provided MIME types is a security flaw. A user could upload an executable or malicious file (e.g., PHP, JS) disguised with a `.jpg` extension if they manage to spoof the MIME type header.
- **Solution:** Implement server-side magic number validation (e.g., using a library like `file-type`) to verify the true content type of the uploaded file buffer before writing it to disk or cloud storage.

### C. Rate Limiting Strategy (`src/lib/auth.ts`)
- **Issue:** The application implements an in-memory rate limiter (`rateLimitMap`) within the Node.js process.
- **Impact:** Medium. In a serverless environment (e.g., Vercel), instances are constantly created and destroyed. Therefore, the in-memory map will frequently reset, rendering the rate limiter largely ineffective against sustained attacks across multiple ephemeral instances.
- **Solution:** Replace the in-memory rate limiter with a distributed storage-backed solution, such as Upstash Redis or Vercel KV, to ensure consistent rate limiting across all server instances.

### D. Session vs. Environment Variable Auth Conflict
- **Issue:** The application seems to employ a dual authentication strategy for administrators.
    - `withAuth` and `checkAdminAuth` rely on NextAuth `getServerSession`.
    - However, `verifyToken` checks against an `ADMIN_TOKEN` environment variable.
    - The instructions explicitly state: "Admin security is centered around the ADMIN_TOKEN environment variable. Authentication is verified via Authorization headers (Bearer token) or admin_token cookies. API routes are protected by the withAuth wrapper, while Server Actions use the ensureAdmin helper."
- **Impact:** Medium. The current implementation of `checkAdminAuth` (which underpins both API routes and Server Actions) relies on NextAuth, not the `ADMIN_TOKEN` logic described in the system guidelines. This inconsistency could lead to confusion or situations where one authentication method is expected but another is enforced.
- **Solution:** Refactor `checkAdminAuth` and the middleware to consistently enforce the required `ADMIN_TOKEN` (via Authorization header or cookies) as the primary authentication mechanism, or fully transition to the NextAuth approach and update the documentation accordingly. Given the system prompts, the `ADMIN_TOKEN` approach should likely be the source of truth for raw API calls.

## 3. Potential Conflicts and Bugs

### A. Two-Step Media Upload Process
- **Issue:** The user must upload a file, wait for it to process, see the input field update with the URL, and *then* remember to click "Save Changes" for that specific section to persist the URL to the database.
- **Impact:** Low severity but poor UX. Users might upload a file and assume it's saved, navigating away and losing the change.
- **Solution:** Automate the save process. Upon successful file upload, the `CMSManagement` component should immediately trigger the `handleSave` function to update the database without requiring manual user intervention.

### B. Empty Value Handling in `updateCMSContent`
- **Issue:** In both the Server Action (`actions.ts`) and the API Route (`/api/admin/cms/route.ts`), there is a check: `if (!id || value === undefined || (typeof value === "string" && value.trim() === ""))`.
- **Impact:** Low. This prevents administrators from intentionally clearing out a CMS field if they want a section to be empty (e.g., removing optional subtitle text).
- **Solution:** Allow empty strings if the database schema permits it (which it does, as it's just a `String`), removing the `value.trim() === ""` check, or handle nullable fields explicitly.

## 4. Summary of Suggested Changes (Action Plan)

1.  **Migrate Storage:** Replace the local file write in `/api/admin/upload/route.ts` with a cloud storage provider (e.g., Vercel Blob or AWS S3).
2.  **Enhance Upload Security:** Add true file type validation (magic numbers) to the upload route instead of trusting client MIME types.
3.  **Upgrade Rate Limiting:** Implement Redis-based rate limiting (e.g., Upstash) in `src/lib/auth.ts` to support serverless deployments.
4.  **Unify Authentication:** Clarify and standardize the authentication flow. Ensure `checkAdminAuth` properly respects the `ADMIN_TOKEN` pattern if that is the intended architecture, rather than solely relying on NextAuth sessions.
5.  **Improve UX:** Modify `CMSManagement.tsx` so that a successful file upload automatically saves the new URL to the database.
6.  **Fix Validation:** Allow empty string saves in `updateCMSContent` to give admins the ability to clear optional fields.
