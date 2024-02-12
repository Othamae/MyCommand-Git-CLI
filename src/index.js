import { trytm } from '@bdsqqq/try'
import { confirm, intro, isCancel, multiselect, outro, select, text } from '@clack/prompts'
import colors from 'picocolors'

import { COMMIT_TYPES } from './commit-types.js'
import { getChangeFiles, getStagesFiles, getUnstagedChangeFiles, gitAdd, gitCommit, gitInit, gitPush, gitRemove } from './git.js'
import { exitProgram } from './utils.js'

intro(colors.inverse(`Commits creation assistant by ${colors.magenta(' @othamae ')}`))

let [changedFiles, errorChangedFiles] = await trytm(getChangeFiles())
let [stagesFiles, errorStagesFiles] = await trytm(getStagesFiles())

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

[changedFiles, errorChangedFiles] = await trytm(getChangeFiles());

[stagesFiles, errorStagesFiles] = await trytm(getStagesFiles())

console.log({ changedFiles, stagesFiles })

if (stagesFiles.length > 0) {
  const action = await confirm({
    initialValue: false,
    message: colors.cyan('Do you want to change files from the stages?')
  })

  if (action) {
    const option = await select({
      message: colors.cyan('What do you want to do?'),
      options: [
        { value: 'add', label: 'Add more files' },
        { value: 'remove', label: 'Remove some files' },
        { value: 'none', label: 'Continue' }
      ]
    })

    if (isCancel(option)) exitProgram()

    if (option === 'add') {
      const [unstagedChangeFiles] = await trytm(getUnstagedChangeFiles())
      const files = await multiselect({
        message: colors.cyan('Please, select the files you want to add to the commit:'),
        options: unstagedChangeFiles.map(file => ({
          value: file,
          label: file
        }))
      })

      if (isCancel(files)) exitProgram()
      await gitAdd({ files })
    }
    if (option === 'remove') {
      const files = await multiselect({
        message: colors.cyan('Please, select the files you want to remove from the commit:'),
        options: stagesFiles.map(file => ({
          value: file,
          label: file
        }))
      })

      if (isCancel(files)) exitProgram()

      await gitRemove({ files })
    }
  }
  [changedFiles, errorChangedFiles] = await trytm(getChangeFiles());

  [stagesFiles, errorStagesFiles] = await trytm(getStagesFiles())

  console.log({ stagesFiles })
  if (isCancel(action)) exitProgram()
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

const commitType = await select({
  message: colors.cyan('Select the type of commit:'),
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key.padEnd(15, ' ')} · ${value.description}`
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
console.log(colors.green('✔ Commit successfully created!'))

// TODO: check if the repo exist
// if so, ask to push. -->gitPush
// if no --> ask to create a new repo and push the changes

// gitCreateRepo

const mergeChanges = await confirm({
  initialValue: true,
  message: `${colors.cyan('Do you want to push the changes to GitHub?')}`
})

if (isCancel(mergeChanges)) exitProgram()

if (!mergeChanges) {
  outro(colors.yellow(`Changed not pushed. ${colors.magenta(' Thanks for using the assistant! ')}`))
  process.exit(0)
}

await gitPush()

outro(colors.green(`✔ Changed successfully pushed to GitHub. ${colors.magenta(' Thanks for using the assistant! ')}`))
