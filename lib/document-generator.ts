import type { WizardState } from '@/types/wizard'
import { FALLBACK_VERSIONS, type VersionMap } from '@/lib/pkg-versions'

// Use a constant for backtick to avoid escaping issues inside template literals
const B = '`'
const FENCE = B + B + B

// ─── Live version state ──────────────────────────────────────────────────────
// Set by generateDocument() before any section function runs.
// Safe for single-threaded (browser) execution.

let _v: VersionMap = {}

/** Return the live major version for `pkg`, or `fb` if not available. */
const mv = (pkg: string, fb: string): string => _v[pkg] ?? FALLBACK_VERSIONS[pkg] ?? fb

/** Format a package.json dependency entry using the live major version. */
const pd = (pkg: string, fb: string): string => `"${pkg}": "^${mv(pkg, fb)}.x"`

// ─── Label helpers (evaluated lazily so they pick up live versions) ──────────

function FRAMEWORK_NAME(fw: string): string {
  const m: Record<string, string> = {
    nextjs:      `Next.js ${mv('next', '15')}`,
    'react-spa': `React ${mv('react', '19')} (Vite)`,
    vue:         `Vue ${mv('vue', '3')}`,
    nuxt:        `Nuxt ${mv('nuxt', '3')}`,
    svelte:      `Svelte ${mv('svelte', '5')} / SvelteKit`,
  }
  return m[fw] ?? fw
}

function COMPONENT_LIB_NAME(lib: string): string {
  const m: Record<string, string> = {
    antd:             `Ant Design ${mv('antd', '5')}`,
    shadcn:           'shadcn/ui',
    mui:              `Material UI v${mv('@mui/material', '6')}`,
    radix:            'Radix UI',
    chakra:           `Chakra UI v${mv('@chakra-ui/react', '3')}`,
    'element-plus':   `Element Plus ${mv('element-plus', '2')}`,
    'ant-design-vue': 'Ant Design Vue',
    'naive-ui':       'Naive UI',
    daisyui:          `daisyUI ${mv('daisyui', '5')}`,
    'carbon-svelte':  'Carbon Components Svelte (IBM)',
    none:             '(no component library)',
  }
  return m[lib] ?? lib
}

function CSS_NAME(css: string): string {
  const m: Record<string, string> = {
    tailwind:           `Tailwind CSS v${mv('tailwindcss', '4')}`,
    'css-modules':      'CSS Modules',
    'styled-components':`Styled Components v${mv('styled-components', '6')}`,
    scss:               'SCSS/Sass',
  }
  return m[css] ?? css
}

function GLOBAL_STATE_NAME(gs: string): string {
  const m: Record<string, string> = {
    zustand:       'Zustand',
    'redux-toolkit': 'Redux Toolkit',
    jotai:         'Jotai',
    'context-api': 'React Context API',
    pinia:         'Pinia',
    vuex:          'Vuex 4',
    'svelte-store':'Svelte Stores (built in)',
  }
  return m[gs] ?? gs
}

function SERVER_STATE_NAME(ss: string): string {
  const m: Record<string, string> = {
    'tanstack-query':    `TanStack Query v${mv('@tanstack/react-query', '5')}`,
    swr:                 'SWR',
    'nuxt-built-in':     'Nuxt useFetch / useAsyncData',
    'sveltekit-built-in':'SvelteKit load()',
    none:                'None (native fetch)',
  }
  return m[ss] ?? ss
}

const PM_RUN: Record<string, string> = {
  npm: 'npm run',
  yarn: 'yarn',
  pnpm: 'pnpm',
  bun: 'bun run',
}

// ─── Section Generators ──────────────────────────────────────────────────────

function s1Overview(s: WizardState): string {
  return `# ${FRAMEWORK_NAME(s.framework)} Frontend Development Standards

> Version: 1.0.0 | Last updated: ${new Date().toISOString().slice(0, 10)} | Scope: all frontend engineers

## 1. Document Overview

### 1.1 Technical Overview

This standard applies to frontend projects based on the following stack:

| Category | Selection |
|---|---|
| Framework | ${FRAMEWORK_NAME(s.framework)} |
| Language | ${s.language === 'typescript' ? 'TypeScript（strict mode）' : 'JavaScript（JSDoc comments）'} |
| Package manager | ${s.pkgMgr} |
| Build tool | ${{ vite: 'Vite', rollup: 'Rollup', webpack: 'Webpack', none: 'Framework built-in' }[s.buildTool]} |
| Component library | ${COMPONENT_LIB_NAME(s.componentLib)} |
| CSS solution | ${CSS_NAME(s.cssSolution)} |
| Global state | ${GLOBAL_STATE_NAME(s.globalState)} |
| Data fetching | ${SERVER_STATE_NAME(s.serverState)} |
| Internationalization | ${{ 'next-intl': `next-intl ${mv('next-intl','3')}`, i18next: `i18next ${mv('i18next','23')}`, 'vue-i18n': `Vue I18n v${mv('vue-i18n','9')}`, 'nuxt-i18n': '@nuxtjs/i18n', none: 'Not required' }[s.i18n]} |
${s.i18n !== 'none' ? `| Text direction | ${{ ltr: 'LTR（left to right）', rtl: 'RTL（right to left）', bidi: 'Bidirectional (LTR + RTL)' }[s.textDirection]} |` : ''}

### 1.2 Standards Levels

- **[Required]** Must be followed; violations will be rejected in code review
- **[Recommended]** Strongly recommended; exceptions must be explained in the PR
- **[Forbidden]** Explicitly forbidden practices or patterns

### 1.3 Version Management

This standards document evolves with the project; changes must be reviewed by the team before merging into the main branch.`
}

function s2TechStack(s: WizardState): string {
  const BUILD_TOOL_NAME: Record<string, string> = {
    vite: 'Vite', rollup: 'Rollup', webpack: 'Webpack', none: 'Framework built-in',
  }
  const buildToolName = BUILD_TOOL_NAME[s.buildTool]

  const buildDevDep = s.buildTool === 'vite'
    ? pd('vite', '6')
    : s.buildTool === 'rollup'
    ? pd('rollup', '4')
    : s.buildTool === 'webpack'
    ? `${pd('webpack', '5')},\n    ${pd('webpack-cli', '5')}`
    : ''

  const buildConfig = s.buildTool === 'vite' ? `\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
  },
})
\`\`\`` : s.buildTool === 'rollup' ? `\`\`\`javascript
// rollup.config.js
export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs' },
    { file: 'dist/index.esm.js', format: 'esm' },
  ],
}
\`\`\`` : s.buildTool === 'webpack' ? `\`\`\`javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: { path: __dirname + '/dist', filename: 'bundle.js' },
  resolve: { extensions: ['.ts', '.tsx', '.js'] },
}
\`\`\`` : '> Use the framework built-in build system (Next.js Turbopack / Nuxt Nitro); no extra configuration is required.'

  const devDeps = [
    s.language === 'typescript' ? `    ${pd('typescript', '5')},\n    ${pd('@types/node', '22')}` : '',
    buildDevDep ? `    ${buildDevDep}` : '',
  ].filter(Boolean).join(',\n')

  const lockFile = { npm: 'package-lock.json', yarn: 'yarn.lock', pnpm: 'pnpm-lock.yaml', bun: 'bun.lockb' }[s.pkgMgr]

  return `## 2. Core Stack Standards

### 2.1 Version Pinning Strategy

**[Required]** The following version policy must be followed:

\`\`\`json
{
  "engines": {
    "node": ">=20.0.0",
    "${s.pkgMgr}": ">=8.0.0"
  },
  "dependencies": {
    ${s.framework === 'nextjs' ? `${pd('next','15')},\n    ${pd('react','19')},\n    ${pd('react-dom','19')}` : ''}
    ${s.framework === 'vue' ? pd('vue','3') : ''}
    ${s.framework === 'nuxt' ? pd('nuxt','3') : ''}
    ${s.framework === 'svelte' ? `${pd('svelte','5')},\n    ${pd('@sveltejs/kit','2')}` : ''}
  },
  "devDependencies": {
${devDeps}
  }
}
\`\`\`

### 2.2 Build Tool Standards（${buildToolName}）

${buildConfig}

### 2.3 Dependency Management Rules

- **[Required]** Commit the \`${lockFile}\` file and do not add it to \`.gitignore\`
- **[Required]** Start an RFC discussion before upgrading a major version
- **[Recommended]** Use \`${s.pkgMgr} outdated\` to regularly check dependency updates
- **[Forbidden]** Use \`*\` or \`latest\` directly as a version range

### 2.4 Install Command Standards

\`\`\`bash
# Install production dependencies
${s.pkgMgr} ${s.pkgMgr === 'npm' ? 'install' : 'add'} <package>

# Install development dependencies
${s.pkgMgr} ${s.pkgMgr === 'npm' ? 'install -D' : 'add -D'} <package>

# Run scripts
${PM_RUN[s.pkgMgr]} dev
${PM_RUN[s.pkgMgr]} build
${PM_RUN[s.pkgMgr]} lint
\`\`\``
}

function s3Directory(s: WizardState): string {
  const x = s.language === 'typescript' ? 'ts' : 'js'
  const xt = s.language === 'typescript' ? 'tsx' : 'jsx'

  // ── Monorepo ───────────────────────────────────────────────────────────────
  const monorepoTree = [
    FENCE,
    'apps/',
    '├── web/                     # Next.js main app',
    '│   ├── app/',
    '│   ├── package.json',
    '│   └── tsconfig.json',
    '├── admin/                   # admin app',
    '│   ├── app/',
    '│   └── package.json',
    '└── mobile/                  # React Native（optional）',
    '',
    'packages/',
    '├── ui/                      # shared component library',
    '│   ├── src/',
    '│   └── package.json',
    '├── config/                  # shared ESLint / TS config',
    '├── utils/                   # shared utilities',
    '└── types/                   # shared TypeScript types',
    '',
    'turbo.json',
    'package.json',
    'pnpm-workspace.yaml',
    FENCE,
  ].join('\n')

  // ── SPA feature-based ──────────────────────────────────────────────────────
  const spaFeature = [
    FENCE,
    'src/',
    '├── features/',
    '│   ├── auth/',
    `│   │   ├── components/`,
    `│   │   ├── hooks/`,
    `│   │   ├── api.${x}`,
    `│   │   ├── types.${x}`,
    `│   │   └── index.${x}`,
    '│   ├── dashboard/',
    `│   │   ├── components/`,
    `│   │   ├── hooks/`,
    `│   │   └── index.${x}`,
    '│   └── user-profile/',
    '├── shared/',
    '│   ├── components/',
    '│   ├── hooks/',
    '│   ├── utils/',
    '│   └── types/',
    '├── app/',
    `│   ├── router.${xt}`,
    `│   └── store.${x}`,
    `└── App.${xt}`,
    FENCE,
  ].join('\n')

  // ── SPA layer-based ────────────────────────────────────────────────────────
  const spaLayer = [
    FENCE,
    'src/',
    '├── assets/',
    '├── components/',
    '│   ├── ui/',
    '│   └── layouts/',
    '├── hooks/',
    '├── pages/',
    '├── services/',
    '├── store/',
    '├── utils/',
    `├── App.${xt}`,
    `└── main.${xt}`,
    FENCE,
  ].join('\n')

  // ── SSR feature-based ──────────────────────────────────────────────────────
  const ssrFeature = [
    FENCE,
    'app/',
    '├── (auth)/',
    '│   ├── login/page.tsx',
    '│   └── layout.tsx',
    '├── (dashboard)/',
    '│   ├── users/page.tsx',
    '│   └── layout.tsx',
    `├── api/users/route.${x}`,
    '└── layout.tsx',
    '',
    'features/',
    '├── auth/',
    '│   ├── components/',
    `│   ├── actions.${x}`,
    `│   └── index.${x}`,
    '└── users/',
    '    ├── components/',
    `    └── index.${x}`,
    '',
    'components/',
    '├── ui/',
    '└── common/',
    FENCE,
  ].join('\n')

  // ── SSR layer-based ────────────────────────────────────────────────────────
  const ssrLayer = [
    FENCE,
    'app/',
    '├── users/page.tsx',
    `├── api/users/route.${x}`,
    '└── layout.tsx',
    '',
    'components/',
    '├── ui/',
    '└── layouts/',
    '',
    'hooks/',
    'lib/',
    `actions/`,
    FENCE,
  ].join('\n')

  const isMonorepo = s.dirPattern === 'monorepo'
  const isSSR = s.framework === 'nextjs' || s.framework === 'nuxt'

  const typeLabel = isMonorepo
    ? 'Monorepo（Turborepo）'
    : isSSR
      ? 'SSR server-side rendering'
      : 'SPA single-page application'

  let tree: string
  if (isMonorepo) tree = monorepoTree
  else if (isSSR) tree = s.dirPattern === 'feature-based' ? ssrFeature : ssrLayer
  else tree = s.dirPattern === 'feature-based' ? spaFeature : spaLayer

  const patternDesc = isMonorepo
    ? 'Multi-App + Shared Packages structure'
    : s.dirPattern === 'feature-based' ? 'by feature module (Feature-based)' : 'by technical layer (Layer-based)'

  return `## 3. Directory Structure Standards

### 3.1 Application Type and Organization Model

- **Application type: ** ${typeLabel}
- **Organization model: ** ${patternDesc}
- **Maximum nesting depth: ** ${isMonorepo ? '3 project-level layers' : `${s.dirDepth} layers`}

### 3.2 Directory Structure

${tree}

### 3.3 Directory Naming Rules

- **[Required]** Directory names must use ${s.fileNaming === 'kebab-case' ? '`kebab-case`（lowercase with hyphens）' : '`camelCase`（camel case）'}
- **[Required]** Component directories and component files must share the same name and use ${s.fileNaming === 'kebab-case' ? `${B}kebab-case${B}` : `${B}PascalCase${B}`}
- **[Forbidden]** Create directory nesting beyond the configured depth

### 3.4 File Export Standards

\`\`\`${s.language === 'typescript' ? 'typescript' : 'javascript'}
// features/users/index.${x} — Export consistently from index; external modules should not import internal files directly
export { UserList } from '${s.fileNaming === 'kebab-case' ? './components/user-list' : './components/UserList'}'
export { useUsers } from './hooks/use-users'
export type { User } from './types'
\`\`\``
}

function s4Naming(s: WizardState): string {
  const ext = s.language === 'typescript' ? 'ts' : 'js'
  const extx = s.language === 'typescript' ? 'tsx' : 'jsx'
  const fname = s.fileNaming === 'kebab-case'

  return `## 4. Naming Standards

### 4.1 Naming Reference

| Type | Standard | Example |
|---|---|---|
| Files/directories | ${fname ? '`kebab-case`' : '`camelCase`'} | \`${fname ? 'user-profile' : 'userProfile'}.${extx}\` |
| React components | \`PascalCase\` | \`UserProfile\` |
| Custom Hooks | ${B}use${B} + ${B}PascalCase${B} | \`useUserProfile\` |
| Utility functions | \`camelCase\` | \`formatDate\` |
| Constants | \`UPPER_SNAKE_CASE\` | \`MAX_RETRY_COUNT\` |
| TypeScript types | \`PascalCase\` | \`UserProfile\` |
| TypeScript interfaces | \`PascalCase\`（no I prefix） | \`UserProfileProps\` |
| Enums | \`PascalCase\` | \`UserRole\` |
| CSS classes | \`kebab-case\` | \`.user-profile\` |
| CSS variables | \`--kebab-case\` | \`--color-primary\` |

### 4.2 Component File Structure

\`\`\`${ext}x
// ${fname ? 'user-profile' : 'UserProfile'}.${extx}
import type { FC } from 'react'

interface UserProfileProps {
  userId: string
  className?: string
}

export const UserProfile: FC<UserProfileProps> = ({ userId, className }) => {
  return <div className={className}>{/* ... */}</div>
}
\`\`\`

### 4.3 Variable Naming Rules

- **[Required]** Boolean values must start with \`is\`、\`has\`、\`can\`、\`should\` : \`isLoading\`、\`hasError\`
- **[Required]** Event handlers must start with \`handle\`: \`handleSubmit\`, \`handleClick\`
- **[Recommended]** Async functions should start with \`fetch\`、\`load\`、\`get\` : \`fetchUsers\`
- **[Forbidden]** Use single-letter variable names, except loop variables \`i\` and \`j\``
}

function s5Components(s: WizardState): string {
  const isNext = s.framework === 'nextjs'
  const ext = s.language === 'typescript' ? 'tsx' : 'jsx'

  const serverClientSection = isNext ? `
### 5.2 Server / Client Component Decision

**Prefer Server Components**，Add only in the following cases \`'use client'\`：

| Requires Client | Does Not Require Client |
|---|---|
| \`useState\` / \`useReducer\` | Data fetching（\`async/await\`） |
| \`useEffect\` | database access |
| browser APIs（\`window\`、\`localStorage\`） | static rendered content |
| event listeners（\`onClick\`、\`onChange\`） | large dependencies (reduce bundle size) |
| third-party client-only libraries | |

\`\`\`${ext}
// ✅ Server Component — direct async, no 'use client'
export default async function UserList() {
  const users = await fetchUsers()
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}

// ✅ Client Component — requires interactivity
'use client'
import { useState } from 'react'
export function SearchBar() {
  const [query, setQuery] = useState('')
  return <input value={query} onChange={e => setQuery(e.target.value)} />
}
\`\`\`` : ''

  const componentLib = s.componentLib !== 'none' ? `
### 5.${isNext ? '4' : '3'} ${COMPONENT_LIB_NAME(s.componentLib)} Usage Standards

- **[Required]** Prefer components provided by the component library and avoid duplicating work
- **[Recommended]** Use \`className\` or the \`sx\` prop to extend styles instead of modifying component library source code
- **[Forbidden]** Override internal component-library CSS selectors such as \`.ant-btn\`）
` : ''

  return `## 5. Component Development Standards

### 5.1 Component File Structure Template

\`\`\`${ext}
${isNext ? "'use client' // add only when needed\n\n" : ''}import type { FC } from 'react'
${s.componentLib === 'shadcn' ? "import { cn } from '@/lib/utils'" : ''}

// 1. Type definitions
interface ComponentNameProps {
  /** Required prop description */
  required: string
  /** Optional prop description */
  optional?: boolean
  className?: string
}

// 2. Component body
export const ComponentName: FC<ComponentNameProps> = ({
  required,
  optional = false,
  className,
}) => {
  // 3. Hooks（order: state → ref → context → custom hooks）

  // 4. Event handlers
  const handleAction = () => { /* ... */ }

  // 5. Render
  return (
    <div${s.cssSolution === 'tailwind' ? ' className={cn("base-class", className)}' : ''}>
      {/* ... */}
    </div>
  )
}
\`\`\`
${serverClientSection}
### 5.${isNext ? '3' : '2'} Props Standards

- **[Required]** Props types must use \`interface\`（not \`type\`），and be exported for parent components
- **[Required]** Optional props must provide default values
- **[Recommended]** Consider splitting the component or using \`children\` pattern
- **[Forbidden]** Pass only the required fields instead of passing an entire state object as a prop
${componentLib}`
}

function s6StateManagement(s: WizardState): string {
  const zustandExample = `\`\`\`typescript
// store/use-user-store.ts
import { create } from 'zustand'

interface UserStore {
  users: User[]
  isLoading: boolean
  fetchUsers: () => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  isLoading: false,
  fetchUsers: async () => {
    set({ isLoading: true })
    const users = await api.getUsers()
    set({ users, isLoading: false })
  },
}))

// Use in components — fine-grained subscriptions to avoid unnecessary rerenders
const users = useUserStore(s => s.users)
const fetchUsers = useUserStore(s => s.fetchUsers)
\`\`\``

  const reduxExample = `\`\`\`typescript
// store/user-slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchUsers = createAsyncThunk('users/fetch', async () => {
  return await api.getUsers()
})

const userSlice = createSlice({
  name: 'users',
  initialState: { list: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.status = 'loading' })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.list = action.payload
        state.status = 'idle'
      })
  },
})
\`\`\``

  const jotaiExample = `\`\`\`typescript
// atoms/user-atom.ts
import { atom } from 'jotai'

export const usersAtom = atom<User[]>([])
export const isLoadingAtom = atom(false)

// Derived atom
export const userCountAtom = atom((get) => get(usersAtom).length)
\`\`\``

  const stateExamples: Record<string, string> = {
    zustand: zustandExample,
    'redux-toolkit': reduxExample,
    jotai: jotaiExample,
    'context-api': `\`\`\`typescript
// context/user-context.tsx
const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  return (
    <UserContext.Provider value={{ users, setUsers }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
\`\`\``,
  }

  const tanstackExample = s.serverState !== 'none' ? `
### 6.2 Server state（${SERVER_STATE_NAME(s.serverState)}）

${s.serverState === 'tanstack-query' ? `\`\`\`typescript
// Data fetching
const { data: users, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.getUsers(),
  staleTime: 5 * 60 * 1000, // do not refetch within 5 minutes
})

// Data mutation
const mutation = useMutation({
  mutationFn: api.createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
\`\`\`` : s.serverState === 'swr' ? `\`\`\`typescript
const { data: users, isLoading, mutate } = useSWR('/api/users', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 5000,
})
\`\`\`` : 'Use native `fetch` or `axios` and wrap request logic in a custom hook.'}` : ''

  return `## 6. State Management Standards

### 6.1 When to Use Each State Type

| State type | Solution | Example |
|---|---|---|
| Local UI state | \`useState\` / \`useReducer\` | modal open state, form values |
| Client global state | ${GLOBAL_STATE_NAME(s.globalState)} | user info, theme, permissions |
| Server/async state | ${SERVER_STATE_NAME(s.serverState)} | API data, pagination, cache |
| Form state | React Hook Form | complex form validation |

${stateExamples[s.globalState] || ''}
${tanstackExample}

### 6.${s.serverState !== 'none' ? '3' : '2'} Forbidden Anti-patterns

- **[Forbidden]** Store server data (API responses) in ${GLOBAL_STATE_NAME(s.globalState)}（should use ${SERVER_STATE_NAME(s.serverState)}）
- **[Forbidden]** Call the same API repeatedly in multiple components
- **[Forbidden]** Mutate state objects directly (return a new object instead)`
}

function s7Styles(s: WizardState): string {
  const tailwindSection = s.cssSolution === 'tailwind' ? `
### 7.1 Tailwind CSS class ordering

**[Recommended]** Order classes as follows, matching \`prettier-plugin-tailwindcss\` automatic sorting:

\`\`\`
Layout -> Size -> Spacing -> Typography -> Color -> Border -> Shadow -> Interaction -> Responsive -> State modifiers
\`\`\`

\`\`\`tsx
// ✅ Correct order
<div className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-900 bg-white border rounded-lg shadow-sm hover:bg-gray-50 md:px-6" />

// ❌ Incorrect - arbitrary order
<div className="hover:bg-gray-50 text-sm bg-white flex rounded-lg border" />
\`\`\`

### 7.2 cn() utility function standards

\`\`\`typescript
import { cn } from '@/lib/utils' // clsx + tailwind-merge

// ✅ Merge conditional classes
<div className={cn(
  'base-class px-4 py-2',
  isActive && 'bg-primary text-white',
  isDisabled && 'opacity-50 cursor-not-allowed',
  className, // allow external override
)} />

// ❌ String concatenation (cannot correctly resolve conflicts)
<div className={\`base-class \${isActive ? 'bg-blue-500' : 'bg-gray-200'}\`} />
\`\`\`` : ''

  const cssModulesSection = s.cssSolution === 'css-modules' ? `
### 7.1 CSS Modules Standard

\`\`\`tsx
// Button.module.css
.button {
  display: inline-flex;
  align-items: center;
}
.button--primary { background-color: var(--color-primary); }
.button--disabled { opacity: 0.5; cursor: not-allowed; }

// Button.tsx
import styles from './Button.module.css'
import { cn } from '@/lib/utils'

<button className={cn(styles.button, isPrimary && styles['button--primary'])} />
\`\`\`` : ''

  const scssSection = s.cssSolution === 'scss' ? `
### 7.1 SCSS Standard

\`\`\`scss
// Define variables consistently in _variables.scss
@use '@/styles/variables' as *;

// ✅ Use BEM naming
.user-card {
  &__header { font-weight: 600; }
  &__body { padding: $spacing-4; }
  &--featured { border: 2px solid $color-primary; }
}

// ❌ Do not nest more than 3 levels
.a { .b { .c { .d { /* Forbidden */ } } } }
\`\`\`` : ''

  return `## 7. Style Standards

${tailwindSection}${cssModulesSection}${scssSection}

### 7.${s.cssSolution !== 'css-modules' ? '3' : '2'} Responsive Breakpoint Standards

| Breakpoint | Width | Use case |
|---|---|---|
| \`sm\` | ≥ 640px | small tablets |
| \`md\` | ≥ 768px | tablets |
| \`lg\` | ≥ 1024px | laptops |
| \`xl\` | ≥ 1280px | desktop |
| \`2xl\` | ≥ 1536px | large desktop |

- **[Required]** Mobile First（Mobile First）：write small-screen styles first, then override upward with breakpoints
- **[Forbidden]** Use \`px\` magic breakpoint numbers; use breakpoints defined by the design system`
}

function s8Toolchain(s: WizardState): string {
  const linterConfig = s.linter === 'eslint' ? `
### 8.1 ESLint Configuration

\`\`\`json
// .eslintrc.json
{
  "extends": [
    ${s.framework === 'nextjs' ? '"next/core-web-vitals",' : ''}
    ${s.language === 'typescript' ? '"plugin:@typescript-eslint/recommended",' : ''}
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    ${s.language === 'typescript' ? '"@typescript-eslint/no-explicit-any": "error",\n    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],' : ''}
    "react-hooks/exhaustive-deps": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }]
  }
}
\`\`\`` : s.linter === 'biome' ? `
### 8.1 Biome Configuration

\`\`\`json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.x/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": { "noExplicitAny": "error" },
      "style": { "useConst": "error" }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
\`\`\`` : `
### 8.1 OXC Configuration

\`\`\`json
// oxc.json
{
  "$schema": "https://json.schemastore.org/oxlintrc.json",
  "rules": {
    "eslint": {
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "prefer-const": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "import/order": ["error", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always"
      }]
    }
  },
  "ignorePatterns": ["node_modules/**", "dist/**", "build/**"]
}
\`\`\``

  const formatterConfig = s.formatter === 'prettier' ? `
### 8.2 Prettier Configuration

\`\`\`json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
\`\`\`` : s.formatter === 'oxc' && s.linter !== 'biome' ? `
### 8.2 OXC Formatting Configuration

\`\`\`json
// oxc.json（formatting section）
{
  "format": {
    "indentWidth": 2,
    "lineWidth": 100,
    "singleQuote": true,
    "trailingComma": "all",
    "semicolons": false
  }
}
\`\`\`

\`\`\`bash
# Format the current directory
oxc format .

# Check formatting (for CI)
oxc format --check .
\`\`\`` : ''

  const huskyConfig = s.preCommit === 'husky-lint-staged' ? `
### 8.${s.formatter !== 'biome' ? '3' : '2'} Husky + lint-staged Configuration

\`\`\`bash
# Initialize
${s.pkgMgr} ${s.pkgMgr === 'npm' ? 'install -D' : 'add -D'} husky lint-staged
npx husky init
\`\`\`

\`\`\`json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "${s.linter === 'biome' ? 'biome check --apply' : s.linter === 'oxc' ? 'oxc --fix' : 'eslint --fix'}",
      ${s.formatter === 'prettier' ? '"prettier --write",' : ''}
      "tsc --noEmit"
    ],
    "*.{css,json,md}": ["prettier --write"]
  }
}
\`\`\`

\`\`\`bash
# .husky/pre-commit
${PM_RUN[s.pkgMgr]} lint-staged

# .husky/commit-msg
npx --no -- commitlint --edit "$1"
\`\`\`` : s.preCommit === 'lefthook' ? `
### 8.${s.formatter === 'prettier' && s.linter !== 'biome' ? '3' : '2'} Lefthook Configuration

\`\`\`yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{ts,tsx}"
      run: ${s.linter === 'biome' ? 'biome check --apply {staged_files}' : s.linter === 'oxc' ? 'oxc --fix {staged_files}' : 'eslint --fix {staged_files}'}
    format:
      glob: "*.{ts,tsx,css,json}"
      run: ${s.formatter === 'prettier' ? 'prettier --write {staged_files}' : s.formatter === 'oxc' ? 'oxc format {staged_files}' : 'biome format --write {staged_files}'}
    typecheck:
      run: tsc --noEmit
\`\`\`` : ''

  const tsConfig = s.language === 'typescript' ? `
### 8.${s.preCommit !== 'none' ? '4' : '3'} TypeScript Configuration Essentials

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                    // [Required]must be enabled
    "noUncheckedIndexedAccess": true,  // safe array access
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "paths": {
      "@/*": ["./*"]                   // path alias
    }
  }
}
\`\`\`` : ''

  return `## 8. Development Toolchain Configuration

${linterConfig}
${formatterConfig}
${huskyConfig}
${tsConfig}`
}

function s9Testing(s: WizardState): string {
  if (s.testing.length === 0) {
    return `## 9. Testing Standards

No automated testing framework is introduced at this stage.

### 9.1 Manual Testing Checklist

Complete the following checks before every PR:

- [ ] Main user flows work correctly
- [ ] Edge cases (empty data, very long text, network errors)
- [ ] Responsive layout works at 375px / 768px / 1280px
- [ ] No console errors or warnings

### 9.2 When to Introduce Tests

Introduce automated tests when these conditions are met:
- The project has stable API contracts
- The team has more than 3 people
- Core business logic is mostly stable`
  }

  const fname = s.fileNaming === 'kebab-case'
  const hasUnit = s.testing.includes('jest') || s.testing.includes('vitest')
  const hasE2E = s.testing.includes('playwright') || s.testing.includes('cypress')
  const unitTool = s.testing.includes('vitest') ? 'vitest' : 'jest'

  return `## 9. Testing Standards

### 9.1 Testing Pyramid Strategy

| Layer | Tool | Coverage ratio | Responsibility |
|---|---|---|---|
${hasUnit ? `| Unit tests | ${unitTool} | 70% | pure functions, hooks, utilities |` : ''}
${hasUnit ? `| Integration tests | ${unitTool} + Testing Library | 20% | component rendering, user interactions |` : ''}
${hasE2E ? `| E2E tests | ${s.testing.includes('playwright') ? 'Playwright' : 'Cypress'} | 10% | core business flows |` : ''}

### 9.2 File Naming Standards

\`\`\`
Component/feature file：${fname ? 'user-profile.tsx' : 'UserProfile.tsx'}
Unit tests：      ${fname ? 'user-profile.test.ts' : 'UserProfile.test.ts'}
Integration tests：      ${fname ? 'user-profile.spec.tsx' : 'UserProfile.spec.tsx'}
E2E tests：      ${fname ? 'user-flow.e2e.ts' : 'userFlow.e2e.ts'}
\`\`\`

${hasUnit ? `### 9.3 ${unitTool === 'vitest' ? 'Vitest' : 'Jest'} Unit Test Standards

\`\`\`typescript
import { describe, it, expect${unitTool === 'vitest' ? ', vi' : ''} } from '${unitTool}'
import { formatDate } from './utils'

describe('formatDate', () => {
  it('formats a valid date correctly', () => {
    expect(formatDate('2024-01-15')).toBe('2024-01-15')
  })

  it('returns empty string for invalid date', () => {
    expect(formatDate('')).toBe('')
  })
})
\`\`\`` : ''}

### 9.${hasUnit ? '4' : '3'} Test Quality Rules

- **[Required]** Core utility coverage ≥ 80%
- **[Recommended]** Each test should verify one behavior (single assertion principle)
- **[Forbidden]** Tests depending on external network requests (must be mocked)
- **[Forbidden]** Tests with order-dependent execution`
}

function s10DesignTokens(s: WizardState): string {
  const spacingValues = s.spacingBase === 4
    ? [4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
    : [8, 16, 24, 32, 48, 64, 80, 96]

  const THEME_NAMES: Record<string, string> = {
    minimalism: 'Minimalism & Swiss Style',
    neumorphism: 'Neumorphism',
    glassmorphism: 'Glassmorphism',
    'dark-oled': 'Dark Mode OLED',
    neubrutalism: 'Neubrutalism',
    aurora: 'Aurora UI',
    claymorphism: 'Claymorphism',
    flat: 'Flat Design',
    'liquid-glass': 'Liquid Glass',
    bento: 'Bento Box Grid',
    cyberpunk: 'Cyberpunk UI',
    retro: 'Retro-Futurism',
    memphis: 'Memphis Design',
    bauhaus: 'Bauhaus',
  }

  const themeName = THEME_NAMES[s.themeStyle] ?? s.themeStyle
  const tokens = s.customTokens

  const FUNCTIONAL_VARS = ['--color-success', '--color-error', '--color-warning', '--color-info', '--color-link']
  const FUNCTIONAL_LABELS: Record<string, string> = {
    '--color-success': 'Success color', '--color-error': 'Error color',
    '--color-warning': 'Warning color', '--color-info': 'Info color', '--color-link': 'Link color',
  }
  const NEUTRAL_VARS = [
    '--color-text-primary', '--color-text-secondary', '--color-text-tertiary',
    '--color-text-disabled', '--color-text-inverse',
    '--color-neutral-bg', '--color-neutral-bg-subtle', '--color-neutral-bg-muted', '--color-neutral-elevated',
    '--color-neutral-divider', '--color-neutral-border', '--color-neutral-border-strong',
  ]
  const NEUTRAL_TEXT_VARS = ['--color-text-primary', '--color-text-secondary', '--color-text-tertiary', '--color-text-disabled', '--color-text-inverse']
  const NEUTRAL_BG_VARS = ['--color-neutral-bg', '--color-neutral-bg-subtle', '--color-neutral-bg-muted', '--color-neutral-elevated']
  const NEUTRAL_BORDER_VARS = ['--color-neutral-divider', '--color-neutral-border', '--color-neutral-border-strong']

  // Split tokens: functional vs neutral vs brand
  const functionalLines = FUNCTIONAL_VARS
    .filter(v => v in tokens)
    .map(v => `  ${v}: ${tokens[v]};  /* ${FUNCTIONAL_LABELS[v]} */`)
    .join('\n')

  const neutralTextLines = NEUTRAL_TEXT_VARS.filter(v => v in tokens).map(v => `  ${v}: ${tokens[v]};`).join('\n')
  const neutralBgLines = NEUTRAL_BG_VARS.filter(v => v in tokens).map(v => `  ${v}: ${tokens[v]};`).join('\n')
  const neutralBorderLines = NEUTRAL_BORDER_VARS.filter(v => v in tokens).map(v => `  ${v}: ${tokens[v]};`).join('\n')
  const allNeutralVars = [...NEUTRAL_VARS]

  const brandLines = Object.entries(tokens)
    .filter(([cssVar]) => !FUNCTIONAL_VARS.includes(cssVar) && !allNeutralVars.includes(cssVar))
    .map(([cssVar, value]) => `  ${cssVar}: ${value};`)
    .join('\n')

  // Spacing block
  const spacingLines = spacingValues
    .map((v, i) => `  --space-${i + 1}: ${v}px;`)
    .join('\n')

  const cssVarsBlock = [
    FENCE + 'css',
    ':root {',
    `  /* ─── Brand Colors & Theme: ${themeName} ─── */`,
    brandLines,
    '',
    '  /* ─── Neutral Colors · Text Layer ─── */',
    neutralTextLines,
    '',
    '  /* ─── Neutral Colors · Background Layer ─── */',
    neutralBgLines,
    '',
    '  /* ─── Neutral Colors · Borders & Dividers ─── */',
    neutralBorderLines,
    '',
    '  /* ─── Functional Colors (follow user color expectations and stay product-wide consistent)─── */',
    functionalLines,
    '',
    `  /* ─── Spacing System（${s.spacingBase}px base）─── */`,
    spacingLines,
    '}',
    FENCE,
  ].join('\n')

  // JS object output
  const jsEntries = Object.entries(tokens)
    .map(([k, v]) => {
      const key = k.replace(/^--/, '').replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      return `  '${key}': '${v}',`
    })
    .join('\n')

  const jsBlock = [
    FENCE + 'typescript',
    '// lib/tokens.ts',
    'export const tokens = {',
    jsEntries,
    '} as const',
    FENCE,
  ].join('\n')

  const tokenOutput = s.tokenConvention === 'css-vars' ? cssVarsBlock
    : s.tokenConvention === 'js-object' ? jsBlock
    : cssVarsBlock + '\n\n' + jsBlock

  return `## 10. Design Tokens Standards

### 10.1 Theme Style

This project uses **${themeName}** theme style (source: ui-ux-pro-max skill).

### 10.2 Functional Color Standards

Functional colors represent clear information states and must follow basic user color expectations. **[Required]** Keep them consistent within the same product system and do not customize them arbitrarily.

| Token | Description | Cognitive principle |
|---|---|---|
| \`--color-success\` | ${tokens['--color-success'] ?? '—'} | green family，Successful actions, completed states |
| \`--color-error\` | ${tokens['--color-error'] ?? '—'} | red family，Failed actions, error messages |
| \`--color-warning\` | ${tokens['--color-warning'] ?? '—'} | yellow/orange family，Needs attention, potential risk |
| \`--color-info\` | ${tokens['--color-info'] ?? '—'} | blue family，General prompts, neutral information |
| \`--color-link\` | ${tokens['--color-link'] ?? '—'} | blue family，clickable links (distinct from normal text) |

**Usage Standards：**
- **[Required]** Functional colors must not be mixed with brand primary colors; for example, \`--color-primary\` must not be used as an error color
- **[Required]** Functional colors and backgrounds must meet WCAG AA contrast (4.5:1)
- **[Recommended]** Provide a light background companion for each functional color, for example \`--color-success-bg: color-mix(in srgb, var(--color-success) 10%, transparent)\`）

### 10.3 Neutral Color Standards

Neutral colors are used heavily for text, backgrounds, borders, and dividers. Account for dark and light backgrounds and follow WCAG 2.0.

#### Text Layer（Text Layer）

| Token | Value | Usage | WCAG requirement |
|---|---|---|---|
| \`--color-text-primary\` | ${tokens['--color-text-primary'] ?? '—'} | Body, headings | ≥ 4.5:1 (AA) |
| \`--color-text-secondary\` | ${tokens['--color-text-secondary'] ?? '—'} | Secondary descriptive text | ≥ 4.5:1 (AA) |
| \`--color-text-tertiary\` | ${tokens['--color-text-tertiary'] ?? '—'} | placeholders, helper hints | ≥ 3:1 (AA Large) |
| \`--color-text-disabled\` | ${tokens['--color-text-disabled'] ?? '—'} | Disabled state (may be below AA) | Decorative |
| \`--color-text-inverse\` | ${tokens['--color-text-inverse'] ?? '—'} | inverse text on dark backgrounds | ≥ 4.5:1 (AA) |

#### Background Layer（Background Layer）

| Token | Value | Usage |
|---|---|---|
| \`--color-neutral-bg\` | ${tokens['--color-neutral-bg'] ?? '—'} | base page background |
| \`--color-neutral-bg-subtle\` | ${tokens['--color-neutral-bg-subtle'] ?? '—'} | Hover states, tag backgrounds |
| \`--color-neutral-bg-muted\` | ${tokens['--color-neutral-bg-muted'] ?? '—'} | Code blocks, quote backgrounds |
| \`--color-neutral-elevated\` | ${tokens['--color-neutral-elevated'] ?? '—'} | cards, dropdown surfaces |

#### Borders & Dividers（Border & Divider）

| Token | Value | Usage |
|---|---|---|
| \`--color-neutral-divider\` | ${tokens['--color-neutral-divider'] ?? '—'} | lightweight section dividers |
| \`--color-neutral-border\` | ${tokens['--color-neutral-border'] ?? '—'} | Inputs, card borders |
| \`--color-neutral-border-strong\` | ${tokens['--color-neutral-border-strong'] ?? '—'} | emphasized dividers, table borders |

**[Required]** Text and background contrast must be validated with [WCAG 2.0 Contrast Checker](https://webaim.org/resources/contrastchecker/)
**[Recommended]** Invert text and background layers for dark themes while keeping functional color semantics unchanged

### 10.4 Typography Standards

#### Type Scale System

Type scale and line height define the rhythm and order of the typography system. This project uses **${
  { 'minor-third': 'Minor Third ×1.2', 'major-third': 'Major Third ×1.25', 'perfect-fourth': 'Perfect Fourth ×1.333', 'major-sixth': 'Major Sixth ×1.5' }[s.typographyScale]
}** ratio。

| Level | CSS Token | Font Size | Line Height | Usage |
|---|---|---|---|---|
${(() => {
  const STEPS = ['4xl','3xl','2xl','xl','lg','base','sm','xs']
  return STEPS.map(step => {
    const sizeVal = tokens[`--font-size-${step}`] ?? '—'
    const lhVal = tokens[`--line-height-${step}`] ?? '—'
    const usage: Record<string, string> = {
      '4xl': 'Super heading, hero area', '3xl': 'Page title H1',
      '2xl': 'Section heading H2', 'xl': 'Subsection H3 / card title',
      'lg': 'Supporting heading H4', 'base': 'Default body',
      'sm': 'Secondary descriptive text', 'xs': 'Labels, notes',
    }
    return `| \`${step}\` | \`--font-size-${step}\` | ${sizeVal} | ${lhVal} | ${usage[step]} |`
  }).join('\n')
})()}

#### Font Weight Standards

Choose font weights based on order, stability, and restraint:

| Weight | Value | Token | Usage |
|---|---|---|---|
| Regular | 400 | \`--font-weight-regular\` | Body text, descriptions, table data |
| Medium | 500 | \`--font-weight-medium\` | Secondary emphasis, labels, button text |
| Semibold | 600 | \`--font-weight-semibold\` | Headings, bold English text |

**[Required]** In most cases, use only Regular and Medium. For bold English text, use Semibold (600), not 700+.

#### Contrast Requirements (WCAG AAA)

Text and background contrast must meet:

| Text type | Requirement | Level |
|---|---|---|
| Body, headings (<=18pt or <=14pt Bold) | ≥ 7:1 | AAA |
| Large text (>18pt or >14pt Bold) | ≥ 4.5:1 | AA |
| Disabled text | Not required（Decorative） | — |

**[Required]** Body and heading text contrast against the page background must reach **7:1 (WCAG AAA)**. Validate with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

### 10.5 Complete Token Definition

${tokenOutput}

### 10.6 Spacing System（${s.spacingBase}px base）

| Token | Value | Use case |
|---|---|---|
${spacingValues.slice(0, 8).map((v, i) => `| \`--space-${i + 1}\` | ${v}px | ${i < 2 ? 'detail padding' : i < 4 ? 'component inner spacing' : i < 6 ? 'spacing between components' : 'section spacing'} |`).join('\n')}

### 10.7 Token Naming Rules

- **[Required]** Use \`kebab-case\`; separate hierarchy with \`-\`
- **[Required]** Use semantic names; do not name tokens by color values such as \`--color-blue\`
- **[Recommended]** Format: \`--[category]-[variant]-[state]\`, such as \`--color-button-bg-hover\`
- **[Recommended]** The color system uses ${s.colorDepth === '3-tier' ? '3 tiers (Primitive -> Semantic -> Component)' : '5 tiers (Primitive -> Alias -> Semantic -> Component -> Override)'}`
}

function s11Git(_s: WizardState): string {
  return `## 11. Git Workflow Standards

### 11.1 Branch Naming Standards

\`\`\`
main          # production branch, protected
develop       # development integration branch
feat/<name>   # new feature：feat/user-auth
fix/<name>    # Bug fix：fix/login-crash
refactor/<name> # refactor：refactor/state-management
chore/<name>  # engineering chore：chore/update-deps
\`\`\`

### 11.2 Commit Message Standards（Conventional Commits）

\`\`\`
<type>(<scope>): <subject>

<body>（optional）

<footer>（optional）
\`\`\`

| type | Meaning |
|---|---|
| \`feat\` | new feature |
| \`fix\` | Bug fix |
| \`docs\` | documentation changes |
| \`style\` | formatting changes (no logic impact) |
| \`refactor\` | refactor (not feat/fix) |
| \`test\` | test-related changes |
| \`chore\` | build/dependency/tooling changes |

\`\`\`bash
# ✅ Correct examples
feat(auth): add OAuth2 login with Google
fix(user): correct avatar loading on slow connections
chore(deps): upgrade react to 18.3.0

# ❌ Incorrect examples
git commit -m "fix bug"
git commit -m "update"
\`\`\`

### 11.3 PR Checklist

\`\`\`markdown
## Change Summary
<!-- Briefly describe the background and goals of this change -->

## Test Verification
- [ ] Runs locally without errors
- [ ] lint / typecheck passes
- [ ] Main flow verified
- [ ] Responsive layout checked

## Screenshots (required for UI changes)
\`\`\``
}

function s12CICD(s: WizardState): string {
  if (s.cicd === 'none') {
    return `## 12. CI/CD Pipeline

No CI/CD tool is currently introduced. Recommended manual deployment checklist:

1. \`${PM_RUN[s.pkgMgr]} lint\` — code checks pass
2. \`${s.language === 'typescript' ? 'npx tsc --noEmit' : `${PM_RUN[s.pkgMgr]} build`}\` — type/build checks pass
${s.testing.length > 0 ? `3. \`${PM_RUN[s.pkgMgr]} test\` — automated tests pass` : ''}
4. Verify core functionality in staging
5. Merge to the main branch and deploy`
  }

  const githubActions = `\`\`\`yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: '${s.pkgMgr}'

      - name: Install dependencies
        run: ${s.pkgMgr} ${s.pkgMgr === 'npm' ? 'ci' : 'install --frozen-lockfile'}

      - name: Lint
        run: ${PM_RUN[s.pkgMgr]} lint

${s.language === 'typescript' ? `      - name: Type check
        run: npx tsc --noEmit
` : ''}${s.testing.length > 0 ? `      - name: Test
        run: ${PM_RUN[s.pkgMgr]} test${s.testing.includes('vitest') ? ' --run' : ''}
` : ''}      - name: Build
        run: ${PM_RUN[s.pkgMgr]} build
\`\`\``

  const gitlabCI = `\`\`\`yaml
# .gitlab-ci.yml
image: node:20-alpine

cache:
  paths:
    - node_modules/

stages:
  - check
  - build

lint:
  stage: check
  script:
    - ${s.pkgMgr} ${s.pkgMgr === 'npm' ? 'ci' : 'install --frozen-lockfile'}
    - ${PM_RUN[s.pkgMgr]} lint
${s.language === 'typescript' ? '    - npx tsc --noEmit' : ''}

${s.testing.length > 0 ? `test:
  stage: check
  script:
    - ${PM_RUN[s.pkgMgr]} test${s.testing.includes('vitest') ? ' --run' : ''}
` : ''}build:
  stage: build
  script:
    - ${PM_RUN[s.pkgMgr]} build
  only:
    - main
    - develop
\`\`\``

  return `## 12. CI/CD Pipeline

${s.cicd === 'github-actions' ? githubActions : gitlabCI}

### Pipeline Stage Notes

| Stage | Content | Failure handling |
|---|---|---|
| Lint | code style checks | PR must not be merged |
${s.language === 'typescript' ? '| Type Check | TypeScript type checking | PR must not be merged |\n' : ''}${s.testing.length > 0 ? '| Test | automated tests | PR must not be merged |\n' : ''}| Build | production build verification | PR must not be merged |`
}

function s13I18n(s: WizardState): string | null {
  if (s.i18n === 'none') return null

  const I18N_LABEL: Record<string, string> = {
    'next-intl': `next-intl ${mv('next-intl', '3')}`,
    i18next:     `i18next ${mv('i18next', '23')} / react-i18next`,
    'vue-i18n':  `Vue I18n v${mv('vue-i18n', '9')}`,
    'nuxt-i18n': '@nuxtjs/i18n',
  }
  const label = I18N_LABEL[s.i18n]

  const dirSection = s.textDirection === 'ltr' ? '' : `
### 13.4 Text direction（${s.textDirection === 'rtl' ? 'RTL' : 'LTR + RTL bidirectional'}）

${s.textDirection === 'rtl' ? `The project only supports RTL languages such as Arabic and Hebrew.` : `The project must support both LTR and RTL layout directions.`}

**CSS Logical Property Standards**：

${FENCE}css
/* [Required]Use logical properties instead of physical direction properties */
/* ❌ Forbidden */
margin-left: 16px;
padding-right: 8px;
border-left: 1px solid;
text-align: left;

/* ✅ Correct */
margin-inline-start: 16px;
padding-inline-end: 8px;
border-inline-start: 1px solid;
text-align: start;
${FENCE}

**HTML dir attribute switching**：

${FENCE}typescript
// Switch text direction
function setDirection(dir: 'ltr' | 'rtl') {
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.lang = dir === 'rtl' ? 'ar' : 'zh-CN'
}
${FENCE}

${s.textDirection === 'bidi' ? `**Bidirectional Layout Test Checklist**：

| Check item | LTR | RTL |
|---|---|---|
| Navigation menu expansion direction | to the right | to the left |
| Icon direction (arrows, back) | ← → | → ← |
| Form input alignment | left aligned | right aligned |
| Toast/notification position | top right | top left |
| Progress bar fill direction | left to right | right to left |` : ''}`

  const configExample = s.i18n === 'next-intl' ? `${FENCE}typescript
// i18n/request.ts（next-intl App Router Configuration）
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(\`../messages/\${locale}.json\`)).default,
}))
${FENCE}

${FENCE}json
// messages/zh-CN.json
{
  "common": {
    "confirm": "Confirm",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "errors": {
    "required": "{field}is required",
    "network": "Network error. Please try again later."
  }
}
${FENCE}

${FENCE}typescript
// Use in components
import { useTranslations } from 'next-intl'

export function ConfirmDialog() {
  const t = useTranslations('common')
  return <button>{t('confirm')}</button>
}
${FENCE}` : s.i18n === 'vue-i18n' || s.i18n === 'nuxt-i18n' ? `${FENCE}typescript
// plugins/i18n.ts（Vue I18n Configuration）
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false, // Composition API mode
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { confirm: 'Confirm', cancel: 'Cancel' },
    en: { confirm: 'Confirm', cancel: 'Cancel' },
  },
})
${FENCE}

${FENCE}vue
<!-- Use in components -->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
</script>

<template>
  <button>{{ t('confirm') }}</button>
</template>
${FENCE}` : `${FENCE}typescript
// i18n/index.ts（i18next Configuration）
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'zh-CN',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
  })

export default i18n
${FENCE}

${FENCE}typescript
// Use in components
import { useTranslation } from 'react-i18next'

export function ConfirmButton() {
  const { t } = useTranslation('common')
  return <button>{t('confirm')}</button>
}
${FENCE}`

  return `## 13. Internationalization Standards（${label}）

### 13.1 Directory Structure

${FENCE}
locales/
├── zh-CN/
│   ├── common.json      # common copy (buttons, prompts, errors)
│   ├── pages/           # copy split by page
│   └── validation.json  # form validation copy
├── en/
│   ├── common.json
│   ├── pages/
│   └── validation.json
${s.textDirection === 'rtl' || s.textDirection === 'bidi' ? `└── ar/
    ├── common.json
    └── pages/
` : ''}${FENCE}

### 13.2 Key Naming Standards

| Rule | ✅ Correct | ❌ Error |
|---|---|---|
| Use lower camel case | \`confirmButton\` | \`ConfirmButton\` |
| Group by semantics | \`errors.networkError\` | \`networkError\` |
| Do not put copy in keys | \`common.confirm\` | \`pleaseClickConfirm\` |
| Use braces for interpolation | \`"Welcome, {name}"\` | \`"Welcome, %s"\` |

### 13.3 Configuration Example

${configExample}
${dirSection}`
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function generateDocument(s: WizardState, v: VersionMap = {}): string {
  // Inject live versions so mv() / pd() / label helpers pick them up
  _v = { ...FALLBACK_VERSIONS, ...v }

  const sections = [
    s1Overview(s),
    s2TechStack(s),
    s3Directory(s),
    s4Naming(s),
    s5Components(s),
    s6StateManagement(s),
    s7Styles(s),
    s8Toolchain(s),
    s9Testing(s),
    s10DesignTokens(s),
    s11Git(s),
    s12CICD(s),
    s13I18n(s),
  ].filter((sec): sec is string => sec !== null)

  _v = {} // reset after generation
  return sections.join('\n\n---\n\n')
}
