import { intro, outro, text, select, confirm, multiselect, isCancel } from '@clack/prompts'
import colors from 'picocolors'
import { trytm } from '@bdsqqq/try'

import { COMMIT_TYPES } from './commit-types.js'
import { getChangeFiles, getStagesFiles, gitCommit, gitAdd } from './git.js'

intro(colors.inverse(`Commits creation ${colors.magenta(' ASSISTANT ')}`))

const [changedFiles, errorChangedFiles] = await trytm(getChangeFiles())
const [stagesFiles, errorStagesFiles] = await trytm(getStagesFiles())

if (errorChangedFiles ?? errorStagesFiles) {
  outro(colors.red('Error: Check that you are in a git repository'))
  process.exit(1)
}

if (stagesFiles.length === 0 && changedFiles.length > 0) {
  const files = await multiselect({
    message: colors.cyan('Please, select the files you want to add to the commit:'),
    options: changedFiles.map(file => ({
      value: file,
      label: file
    }))
  })

  if (isCancel(files)) {
    outro(colors.red('Error: No files to commit'))
    process.exit(0)
  }

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

console.log(commitType)

const commitMsg = await text({
  message: colors.cyan('Add the commit message:'),
  validate: (value) => {
    if (value.length === 0) return colors.red('The message is empty.')
    if (value.length > 50) return colors.red('The message cannot have more than 100 characters.')
  }
  // placeholder: 'Add new feature'

})

const { emoji, release } = COMMIT_TYPES[commitType]

let breakingChange = false
if (release) {
  breakingChange = await confirm({
    initialValue: false,
    message: `${colors.cyan('Does this commit have changes that break previous compatibility?')}
        ${colors.yellow('If the answer is yes, you should create a commit with the type "BREAKING CHANGE" and when you release a major version will be published')}`
  })
}

let commit = `${emoji} ${commitType} ${commitMsg}`
commit = breakingChange ? `${commit}[breaking change]` : commit

const shouldContinue = await confirm({
  initialValue: true,
  message: `${colors.cyan('Do you want to create the commit with the following message?')}
    
    ${colors.green(colors.bold(commit))}
    
    ${colors.cyan('Do your confirm?')}`
})

if (!shouldContinue) {
  outro(colors.yellow('Commit not created.'))
  process.exit(0)
}

await gitCommit({ commit })

outro(colors.green(`✔ Commit successfully created. ${colors.magenta(' Thanks for using the assistant! ')}`))
