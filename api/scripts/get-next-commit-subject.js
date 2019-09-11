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

/* eslint-disable no-console */
module.exports = function getNextCommitSubject(messageTitle, branchName) {

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
  const issueTag = getIssueTagFromBranchName(branchName);

  if (issueTag && isCommitMessageToBePrepended(messageTitle) && isBranchModifiable(branchName)) {

    // Apply the issue tag to message title
    const newTitle = `[${issueTag}] ${messageTitle}`;

    if (process.env.NODE_ENV !== 'test') {
      console.log(`[prepend-commit-message] New message title: ${newTitle}`);
    }
    return newTitle;

  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[prepend-commit-message] Commit message not to be modified');
    }
    return messageTitle;
  }
};
