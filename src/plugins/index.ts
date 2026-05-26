// Frontend plugins are compile-time modules. Any plugin placed under
// `src/plugins/<plugin-name>/index.tsx` or `index.ts` is automatically bundled
// and executed here. Plugin authors should keep all frontend files inside their
// own plugin directory and call `registerFrontendPlugin(...)` from that entry.
import.meta.glob(["./*/index.ts", "./*/index.tsx"], { eager: true });