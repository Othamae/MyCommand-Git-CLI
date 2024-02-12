import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

function cleanStdout (stdout) {
  return stdout.trim().split('\n').filter(Boolean)
}

export async function gitInit () {
  const { stdout } = await execAsync('git init')
  // console.log(stdout)
  return cleanStdout(stdout)
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

export async function getUnstagedChangeFiles () {
  const { stdout } = await execAsync('git status --porcelain')
  return cleanStdout(stdout)
    .filter((line) => line.startsWith(' M') || line.startsWith('??'))
    .map((line) => line.split(' ').at(-1))
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

export async function gitRemove ({ files = [] } = {}) {
  const filesLine = files.join(' ')
  const { stdout } = await execAsync(`git reset ${filesLine}`)
  return cleanStdout(stdout)
}

export async function gitCreateRepo () {
  const { stdout } = await execAsync(`git remote add origin gitgit@github.com:${process.env.GIT_USERNAME}/<reponame>.git`)
  return cleanStdout(stdout)
}

export async function gitPush () {
  const { stdout } = await execAsync('git push')
  return cleanStdout(stdout)
}
