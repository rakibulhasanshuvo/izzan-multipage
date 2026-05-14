Based on the findings in admin-cms-audit-report.md and an initial exploration, here is the report on the global audit of the codebase:

# Global Audit Report

## 1. Storage and File Handling
*   **Vulnerability/Issue:** The application handles file uploads (e.g., in `/api/admin/upload/route.ts`) by saving files to the local file system (`public/uploads`). This is problematic for serverless environments (like Vercel) where the filesystem is ephemeral, causing uploaded files to disappear after a deployment or when instances spin down.
*   **Solution:** Migrate file upload logic to use a cloud storage provider (e.g., AWS S3, Cloudinary, Vercel Blob, Supabase Storage). Return the generated CDN URL instead of a local path.

## 2. File Upload Security
*   **Vulnerability/Issue:** The upload API only verifies the file type using the client-provided MIME type (e.g., `file.type`). This can be easily spoofed by an attacker, allowing them to upload malicious files disguised as images.
*   **Solution:** Implement server-side "magic number" validation using a library like `file-type` to verify the true content of the file buffer before it is saved or uploaded to cloud storage.

## 3. Rate Limiting Strategy
*   **Vulnerability/Issue:** The rate-limiting logic in `src/lib/auth.ts` relies on an in-memory `Map` (`rateLimitMap`). In a serverless environment, instances are created and destroyed frequently, causing the map to reset. This renders the rate limiter ineffective against distributed or sustained attacks.
*   **Solution:** Replace the in-memory rate limiter with a distributed cache or storage-backed solution (e.g., Upstash Redis, Vercel KV) to ensure consistent rate limiting across all serverless instances.

## 4. Authentication Flow Inconsistency
*   **Vulnerability/Issue:** There is a discrepancy between the implemented authentication and the documented architecture. Functions like `withAuth` and `checkAdminAuth` rely on NextAuth (`getServerSession`), whereas `verifyToken` and system prompts state that authentication should center around the `ADMIN_TOKEN` environment variable (via headers or cookies).
*   **Solution:** Unify the authentication strategy. Either fully transition to the NextAuth implementation and update the documentation/guidelines, or refactor `checkAdminAuth` and the middleware to consistently enforce the `ADMIN_TOKEN` approach as the primary security layer for admin API routes and Server Actions.

## 5. CMS Upload UX
*   **Vulnerability/Issue:** In the CMS Management component, uploading media is a two-step process. A user uploads a file, waits for the URL to populate in the input field, and must then explicitly click "Save Changes" to persist the URL to the database. This can easily lead to unsaved changes.
*   **Solution:** Automate the save operation. Modify `src/components/admin/CMSManagement.tsx` so that successfully uploading a file automatically triggers the save function to persist the new URL immediately.

## 6. CMS Content Validation (Empty Values)
*   **Vulnerability/Issue:** The `updateCMSContent` Server Action and its associated API route strictly check for empty strings (`value.trim() === ""`). This prevents an administrator from intentionally clearing an optional CMS field (e.g., removing a subtitle).
*   **Solution:** Update the validation logic in `updateCMSContent` to allow empty strings, assuming the database schema permits empty `String` values for those fields.

## 7. Package Dependencies & Audit
*   **Vulnerability/Issue:** Running `npm audit` reveals moderate severity vulnerabilities in dependencies (specifically `postcss`, caused by `next`).
*   **Solution:** Run `npm audit fix` or upgrade the `next` package and related dependencies to versions that address these vulnerabilities.
