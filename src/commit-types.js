export const COMMIT_TYPES = {

  feat: {
    emoji: '✨',
    description: 'Add new feature',
    release: true // que si haces un commit de este tipo, luego deberías hacer un release
  },
  fix: {
    emoji: '🐛',
    description: 'Submit a fix to a bug',
    release: true
  },
  perf: {
    emoji: '⚡️',
    description: 'Improve performance',
    release: true
  },
  refactor: {
    emoji: '♻️ ',
    description: 'Refactor code',
    release: true
  },
  docs: {
    emoji: '📚',
    description: 'Add or update documentation',
    release: false
  },
  style: {
    emoji: '💄',
    description: 'Add or update styles',
    release: true
  },
  accessibility: {
    emoji: '♿',
    description: 'Improve accessibility',
    release: true
  },
  dependencies: {
    emoji: '➕',
    description: 'Add or Update dependencies',
    release: true
  },
  responsive: {
    emoji: '📱',
    description: 'Work on responsive design',
    release: true
  },
  db: {
    emoji: '🛢️ ',
    description: 'Database related changes',
    release: true
  },
  deadCode: {
    emoji: '💩',
    description: 'Remove dead code',
    release: true
  },
  test: {
    emoji: '🧪',
    description: 'Add or update tests',
    release: false
  },
  build: {
    emoji: '🏗️ ',
    description: 'Add or update build scripts',
    release: false
  }

}
