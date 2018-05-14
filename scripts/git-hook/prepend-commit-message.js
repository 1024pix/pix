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
 * > branch name starts with AA-XXX_something (e.g. pi-123_branch-description)
 *
 * THEN
 * > prepend the issue tag to the commit message
 *
 * My awesome commit -> [pi-123] My awesome commit
 */

console.log('Checking commit message...');

const startsWithBraces = (str) => str.match(/^\[[^\]]/);
const startsWithMergeBranch = (str) => str.indexOf('Merge branch') === 0;
const startsWithMergePR = (str) => str.indexOf('Merge pull request') === 0;
const startsWithHash = (str) => str.indexOf('#') === 0;

const isMessageToBePrepended = (str) =>
  !startsWithBraces(str) &&
  !startsWithMergeBranch(str) &&
  !startsWithMergePR(str) &&
  !startsWithHash(str);

const tagMatcher = new RegExp('^(..-\\d+)', 'i');

const getIssueTagFromBranchName = (str) => {
  const matched = str.match(tagMatcher);
  return matched[0];
};

const messageFile = process.env.GIT_PARAMS;
const message = fs.readFileSync(messageFile, { encoding: 'utf-8' });

const messageTitle = message.split('\n')[0];

const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' })
  .split('\n')[0];

const issueTag = getIssueTagFromBranchName(branchName);

if (issueTag && isMessageToBePrepended(messageTitle)) {
  console.log('Changing commit message...');

  // Apply the issue tag to message title
  const messageLines = message.split('\n');
  messageLines[0] = `[${issueTag}] ${messageTitle}`;
  fs.writeFileSync(messageFile, messageLines.join('\n'), { encoding: 'utf-8' });

  console.log(`New message title: ${messageLines[0]}`);
}

console.log('Commit message ok');
