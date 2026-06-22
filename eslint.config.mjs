// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

// Append prettier last so it disables any ESLint formatting rules that
// would conflict with Prettier. Formatting itself is handled by `format:fix`.
export default withNuxt().append(prettier)
