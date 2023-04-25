const { exec } = require('node:child_process');
const path = require('node:path');
const isEmpty = require('lodash.isempty');
const inquirer = require('inquirer');
const ora = require('ora-classic');

(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
})();

async function main() {
  const modifiedFilesList = await _getModifiedPackageLockFilesList();
  const choices = modifiedFilesList.map((file) => ({
    checked: true,
    name: file.filePath,
    value: file.directoryPath,
  }));
  const prompt = [
    {
      choices,
      message: 'Choose one ore more applications to update',
      name: 'modifiedFilesList',
      type: 'checkbox',
    },
  ];

  return inquirer
    .prompt(prompt)
    .then((answers) => {
      const { modifiedFilesList } = answers;
      return Promise.allSettled(modifiedFilesList.map(_updateApplicationDependencies));
    })
    .then((result) => {
      console.log(result);
    });
}

async function _getModifiedPackageLockFilesList() {
  return new Promise((resolve, reject) => {
    exec('git diff --name-only HEAD@{1} HEAD | grep -E package-lock.json', function (error, stdout, stderr) {
      if (error) return reject(error);
      if (stderr) return reject(new Error(stderr));

      const files = stdout.split('\n').filter(_removeEmptyFilePathFilter).map(_transform);

      resolve(files);
    });
  });
}

function _removeEmptyFilePathFilter(filePath) {
  return !isEmpty(filePath);
}

function _transform(filePath) {
  const { dir: directoryPath, base: fileName} = path.parse(filePath);
  return {directoryPath, fileName, filePath};
}

async function _updateApplicationDependencies(applicationDirectoryPath) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '..', applicationDirectoryPath);
    const command = `cd ${filePath} && npm ci`;

    const spinner = ora(`Running "npm ci" command in "${filePath}"`).start();

    exec(command, function (error) {
      if (error) {
        spinner.fail(`Dependencies update process failed for "${applicationDirectoryPath}" application`);
        return reject(error);
      }

      spinner.succeed(`Dependencies updated for "${applicationDirectoryPath}" application`);
      resolve();
    });
  });
}
