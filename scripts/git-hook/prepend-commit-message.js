#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

/*
 * IF message title:
 * > Doesn't start with square brackets []
 * > Doesn't start with Merge branch
 * > Doesn't start with Merge pull request
 * > Doesn't start with #
 *
 * AND
 * > branch name starts with AA-XXX-something (e.g. pi-123-branch-description)
 * > branch name is not:
 * > - dev
 * > - master
 * > - gh-pages
 * > - release-xxx
 *
 * THEN
 * > prepend the issue tag to the commit message
 *
 * My awesome commit -> [pi-123] My awesome commit
 */

console.log('[prepend-commit-message] Checking commit message...');

const startsWithBraces = (str) => str.match(/^\[[^\]]/);
const startsWithMergeBranch = (str) => str.indexOf('Merge branch') === 0;
const startsWithMergePR = (str) => str.indexOf('Merge pull request') === 0;
const startsWithHash = (str) => str.indexOf('#') === 0;

const isCommitMessageToBePrepended = (str) =>
  !startsWithBraces(str) &&
  !startsWithMergeBranch(str) &&
  !startsWithMergePR(str) &&
  !startsWithHash(str);

const branchesNotToModify = [
  'dev',
  'master',
  'gh-pages',
];

const isBranchModifiable = (branchName) => !branchesNotToModify.includes(branchName);

const tagMatcher = new RegExp('^(..-\\d+)', 'i');

const getIssueTagFromBranchName = (str) => {
  const matched = str.match(tagMatcher);
  if (matched && matched[0]) {
    return matched[0];
  }
};

const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).split('\n')[0];

const messageFile = process.env.GIT_PARAMS;
const message = fs.readFileSync(messageFile, { encoding: 'utf-8' });

const messageTitle = message.split('\n')[0];

const issueTag = getIssueTagFromBranchName(branchName);

if (issueTag && isCommitMessageToBePrepended(messageTitle) && isBranchModifiable(branchName)) {

  // Apply the issue tag to message title
  const messageLines = message.split('\n');
  messageLines[0] = `[${issueTag}] ${messageTitle}`;
  fs.writeFileSync(messageFile, messageLines.join('\n'), { encoding: 'utf-8' });

  console.log(`[prepend-commit-message] New message title: ${messageLines[0]}`);

} else {
  console.log('[prepend-commit-message] Commit message not to be modified');
}

