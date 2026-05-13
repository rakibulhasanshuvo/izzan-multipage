1. Install `winston` as our logging infrastructure.
2. Create `src/lib/logger.ts` config file to wrap winston.
3. Replace `console.error` in `src/lib/api.ts` with the new logger.
4. Replace `console.error` in `src/lib/db.ts` with the new logger.
5. Consider replacing `console.error` with the new logger on the server-side, and maybe leave `console.error` in client components (or use a different library if we want to stream client logs back). As Winston doesn't run well in Edge or Client environments, we will stick to using Winston for server-side `src/lib/api.ts` and `src/lib/db.ts` which are executed on the Node server.
