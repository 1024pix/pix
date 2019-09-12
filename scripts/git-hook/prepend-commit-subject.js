#!/usr/bin/env node
const getNextCommitSubject = require('../../api/scripts/get-next-commit-subject');
const NextGitCommitMessage = require('../../api/scripts/NextGitCommitMessage');

console.log('[prepend-commit-message] Checking commit message...');

const commit = new NextGitCommitMessage(process.env.HUSKY_GIT_PARAMS);
const nextSubject = getNextCommitSubject(commit.getSubject(), commit.getCurrentBranch());

commit.updateSubject(nextSubject);

