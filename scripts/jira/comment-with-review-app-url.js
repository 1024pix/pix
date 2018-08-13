#!/usr/bin/env node
const axios = require('axios');

const JIRA_API_VERSION = '2';
const JIRA_API_URL = `https://1024pix.atlassian.net/rest/api/${JIRA_API_VERSION}`;

const contextObject = Object.seal({ issueCode: '' });

extractIssueCodeFromBranchName(process.env.CIRCLE_BRANCH)
  .then(({ issueCode }) => {
    console.log(`Getting existing comments on JIRA issue: ${issueCode}`);
    contextObject.issueCode = issueCode;
    return axios({
      method: 'get',
      url: `${JIRA_API_URL}/issue/${issueCode}/comment`,
      auth: {
        username: process.env.JIRA_API_KEY,
        password: process.env.JIRA_API_SECRET,
      },
    });
  })
  .then((response) => {
    const commentContents = response.data.comments.map((comment) => comment.body);

    if (process.env.CIRCLE_PULL_REQUEST) {

      console.log(`Generating Review apps urls for pull request: ${process.env.CIRCLE_PULL_REQUEST}`);

      return Promise.all([
        commentContents,
        extractPRNumberFromPRURL(process.env.CIRCLE_PULL_REQUEST),
      ]);
    } else {
      return Promise.reject(new Error('The Pull Request associated to the branch was not found.'));
    }
  })
  .then(([commentContents, { prNumber }]) => {

    const raMonPixURL = `https://pix-mon-pix-integration-pr${prNumber}.scalingo.io`;
    const raOragaURL = `https://pix-orga-integration-pr${prNumber}.scalingo.io`;
    const raAPIURL = `https://pix-api-integration-pr${prNumber}.scalingo.io`;

    const scalingoCommentRegex = new RegExp(`${raMonPixURL}`, 'i');

    console.log(`Checking comment has not already been posted for PR number: ${prNumber}`);

    const hasAlreadyScalingoComment = commentContents.reduce((hasAlreadyScalingoComment, comment) => {

      const hasScalingoComment = comment.match(scalingoCommentRegex);
      return hasAlreadyScalingoComment || hasScalingoComment;

    }, false);

    if (hasAlreadyScalingoComment) {
      console.log('Review apps urls already found in issue comments. No need to add it again');
    } else {
      const text = `Je m'apprête à déployer la Review App. Elle sera consultable sur les URL suivantes:\n` +
                   `- Mon Pix: ${raMonPixURL}\n` +
                   `- Orga: ${raOragaURL}\n` +
                   `- API (Postman): ${raAPIURL}`;

      console.log(`Posting Review apps urls for PR number: ${prNumber} to JIRA issue: ${contextObject.issueCode}`);
      return axios({
        method: 'post',
        url: `${JIRA_API_URL}/issue/${contextObject.issueCode}/comment`,
        headers: { 'Content-Type': 'application/json' },
        auth: {
          username: process.env.JIRA_API_KEY,
          password: process.env.JIRA_API_SECRET,
        },
        data: {
          body: text,
        },
      });
    }
  })
  .then(() => {
    console.log('Script done.');
    process.exit();
  })
  .catch((error) => {
    console.error(error.message);
    console.log('Stopping here.');
    console.log('Script failed.');
    process.exit();
  });

function extractIssueCodeFromBranchName(brancheName) {

  const jiraIssueNameRegex = new RegExp(/^\w+-\d+/, 'i');
  const regexMatches = brancheName.match(jiraIssueNameRegex);

  if (regexMatches) {
    return Promise.resolve({ issueCode: regexMatches[0] });
  } else {
    return Promise.reject(new Error('The id of the Jira issue could not be found.'));
  }
}

function extractPRNumberFromPRURL(pullRequestURL) {

  const PRnumberRegex = new RegExp(/pix\/pull\/(\d+)/, 'i');
  const regexMatches = pullRequestURL.match(PRnumberRegex);

  if (regexMatches) {
    return Promise.resolve({ prNumber: regexMatches[1] });
  } else {
    return Promise.reject(new Error('The PR number could not be found.'));
  }
}
