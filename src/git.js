import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

function cleanStdout (stdout) {
  return stdout.trim().split('\n').filter(Boolean)
}

export async function getChangeFiles () {
  const { stdout } = await execAsync('git status --porcelain')
  // console.log(stdout)
  return cleanStdout(stdout).map((line) => line.split(' ').at(-1))
}

export async function getStagesFiles () {
  const { stdout } = await execAsync('git diff --cached --name-only')
  // console.log(stdout)
  return cleanStdout(stdout)
}

export async function gitCommit ({ commit } = {}) {
  const { stdout } = await execAsync(`git commit -m "${commit}"`)
  // console.log(stdout)
  return cleanStdout(stdout)
}

export async function gitAdd ({ files = [] } = {}) {
  const filesLine = files.join(' ')
  const { stdout } = await execAsync(`git add ${filesLine}`)
  return cleanStdout(stdout)
}
