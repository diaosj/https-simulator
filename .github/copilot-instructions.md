# 动画与 UI 技能规范
1. 你必须精通 `framer-motion`。在处理复杂动画序列时，优先使用 `useAnimate` 和 `async/await`，不要用老旧的 `Variants`。
2. 我们的 UI 强制采用赛博朋克极客风，请熟练使用 `bg-slate-950`、`border-cyan-500` 和 `font-mono text-green-400` 这套调色盘。
3. 禁止在 UI 中使用 Emoji，必须调用 `lucide-react` 的图标。
4. 提交代码前，必须确保 TypeScript 没有 `any` 类型的警告。
