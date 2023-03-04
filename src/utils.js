import { outro } from '@clack/prompts'
import colors from 'picocolors'

export function exitProgram ({ code = 0, msg = 'Exit: No files to commit' } = {}) {
  outro(colors.blue(msg))
  process.exit(code)
}
