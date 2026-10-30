# Forma: recruitment and Tailwind components

Forma focuses on candidate intake, search, detail, status progression and recruitment pipeline summaries. Unused copied task/movie/order dashboard code has been removed.

Component layouts, controls, interaction states, responsive rules and illustrations use Tailwind utilities in TSX. Global CSS is limited to font/theme foundations, document accessibility, animation keyframes and print rules. Do not recreate component selector stylesheets or wrap legacy CSS declarations in `@apply` as a substitute for a component refactor.

Account data, appearance preferences, demo isolation and existing candidate workflows are preserved. Connected browser tests use isolated ports and a disposable PostgreSQL database; API child processes receive graceful shutdown and temporary databases are stopped afterwards.
