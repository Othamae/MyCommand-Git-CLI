import { intro, outro, text, select, confirm, multiselect, isCancel } from '@clack/prompts'
import colors from 'picocolors'
import { trytm } from '@bdsqqq/try'

import { exitProgram } from './utils.js'
import { COMMIT_TYPES } from './commit-types.js'
import { getChangeFiles, getStagesFiles, gitCommit, gitAdd, gitInit } from './git.js'

intro(colors.inverse(`Commits creation assistant by ${colors.magenta(' @othamae ')}`))

const [changedFiles, errorChangedFiles] = await trytm(getChangeFiles())
const [stagesFiles, errorStagesFiles] = await trytm(getStagesFiles())

if (errorChangedFiles ?? errorStagesFiles) {
  const createGitInit = await confirm({
    initialValue: true,
    message: `${colors.red('There is no git created in this repository')}
      
      ${colors.yellow(colors.bold('Do you want to create it?'))}`
  })

  if (isCancel(createGitInit)) exitProgram()

  if (createGitInit) {
    await gitInit()
    outro(colors.green('✔ Git successfully created!!'))
    process.exit(0)
  } else {
    outro(colors.red('There is no git for this repository'))
    process.exit(1)
  }
}

if (stagesFiles.length === 0 && changedFiles.length > 0) {
  const files = await multiselect({
    message: colors.cyan('Please, select the files you want to add to the commit:'),
    options: changedFiles.map(file => ({
      value: file,
      label: file
    }))
  })

  if (isCancel(files)) exitProgram()

  await gitAdd({ files })
}

console.log({ changedFiles, stagesFiles })

const commitType = await select({
  message: colors.cyan('Select the type of commit:'),
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key.padEnd(8, ' ')} · ${value.description}`
  }))

})

if (isCancel(commitType)) exitProgram()

console.log(commitType)

const commitMsg = await text({
  message: colors.cyan('Add the commit message:'),
  validate: (value) => {
    if (value.length === 0) return colors.red('The message is empty.')
    if (value.length > 50) return colors.red('The message cannot have more than 100 characters.')
  }
  // placeholder: 'Add new feature'

})

if (isCancel(commitMsg)) exitProgram()

const { emoji, release } = COMMIT_TYPES[commitType]

let breakingChange = false
if (release) {
  breakingChange = await confirm({
    initialValue: false,
    message: `${colors.cyan('Does this commit have changes that break previous compatibility?')}
        ${colors.yellow('If the answer is yes, you should create a commit with the type "BREAKING CHANGE" and when you release a major version will be published')}`
  })

  if (isCancel(breakingChange)) exitProgram()
}

let commit = `${emoji} ${commitType} ${commitMsg}`
commit = breakingChange ? `${commit}[breaking change]` : commit

const shouldContinue = await confirm({
  initialValue: true,
  message: `${colors.cyan('Do you want to create the commit with the following message?')}
    
    ${colors.green(colors.bold(commit))}
    
    ${colors.cyan('Do your confirm?')}`
})

if (isCancel(shouldContinue)) exitProgram()

if (!shouldContinue) {
  outro(colors.yellow('Commit not created.'))
  process.exit(0)
}

await gitCommit({ commit })

outro(colors.green(`✔ Commit successfully created. ${colors.magenta(' Thanks for using the assistant! ')}`))
