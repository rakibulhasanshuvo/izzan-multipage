1. **Analyze existing documentation & configurations.**
   - Reviewed `package.json`, `README.md`, `next.config.ts`, `admin-cms-audit-report.md`.
2. **Perform static analysis.**
   - Ran `npx tsc --noEmit` and `npm run lint`.
3. **Execute security and vulnerability checks.**
   - Ran `npm audit` to check for dependency vulnerabilities.
4. **Inspect code architecture and logic.**
   - Explored the CMS logic (`src/app/(admin)/admin/cms`, `src/components/admin/CMSManagement.tsx`).
   - Inspected File Upload (`src/app/api/admin/upload/route.ts`).
   - Inspected Authentication (`src/lib/auth.ts`, `src/lib/auth-options.ts`, `src/app/(admin)/admin/actions.ts`).
5. **Synthesize findings into a report.**
   - Created `global_audit_report.md` summarizing the issues and proposing solutions.
