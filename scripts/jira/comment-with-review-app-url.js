#!/usr/bin/env node
const axios = require('axios');

const JIRA_API_VERSION = '2';
const JIRA_API_URL = `https://1024pix.atlassian.net/rest/api/${JIRA_API_VERSION}`;

async function main() {
  const appName = process.env.APP_NAME;
  const prNumber = extractPRNumberFromAppName(appName);
  const branchName = await getBranchNameFromPRNumber(prNumber);
  const issueCode = extractIssueCodeFromBranchName(branchName);

  console.log(`Generating Review apps urls for pull request: ${prNumber}`);

  const raAppURL = `https://app-pr${prNumber}.review.pix.fr`;
  const raOrgaURL = `https://orga-pr${prNumber}.review.pix.fr`;
  const raCertifURL = `https://certif-pr${prNumber}.review.pix.fr`;
  const raAdminURL = `https://admin-pr${prNumber}.review.pix.fr`;
  const raAPIURL = `https://pix-api-integration-pr${prNumber}.scalingo.io`;

  const scalingoCommentRegex = new RegExp(raAppURL, 'i');

  console.log(`Getting existing comments on JIRA issue: ${issueCode}`);

  const commentsResponse = await axios({
    method: 'get',
    url: `${JIRA_API_URL}/issue/${issueCode}/comment`,
    auth: {
      username: process.env.JIRA_API_KEY,
      password: process.env.JIRA_API_SECRET,
    },
  });

  const commentContents = commentsResponse.data.comments.map((comment) => comment.body);

  console.log(`Checking comment has not already been posted for PR number: ${prNumber}`);

  const hasAlreadyScalingoComment = commentContents.some((comment) => comment.match(scalingoCommentRegex));

  if (hasAlreadyScalingoComment) {
    console.log('Review apps urls already found in issue comments. No need to add it again');
  } else {
    const text = `Je viens de déployer la Review App. Elle sera consultable sur les URL suivantes :\n` +
      `- App : ${raAppURL}\n` +
      `- Orga : ${raOrgaURL}\n` +
      `- Certif : ${raCertifURL}\n` +
      `- Admin : ${raAdminURL}\n` +
      `- API (Postman) : ${raAPIURL}`;

    console.log(`Posting Review apps urls for PR number: ${prNumber} to JIRA issue: ${issueCode}`);

    await axios({
      method: 'post',
      url: `${JIRA_API_URL}/issue/${issueCode}/comment`,
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
}

function extractIssueCodeFromBranchName(branchName) {
  const jiraIssueNameRegex = new RegExp(/^\w+-\d+/, 'i');
  const regexMatches = branchName.match(jiraIssueNameRegex);

  if (regexMatches) {
    return regexMatches[0];
  } else {
    throw new Error('The id of the Jira issue could not be found.');
  }
}

function extractPRNumberFromAppName(appName) {
  const PRnumberRegex = new RegExp(/integration-pr(\d+)/);
  const regexMatches = appName.match(PRnumberRegex);

  if (regexMatches) {
    return regexMatches[1];
  } else {
    throw new Error('The PR number could not be found.');
  }
}

async function getBranchNameFromPRNumber(prNumber) {
  const pr = await axios(`https://api.github.com/repos/1024pix/pix/pulls/${prNumber}`);
  return pr.ref.head;
}

main()
  .then(() => {
    console.log('Script done.');
    process.exit();
  }, (error) => {
    console.error(error.message);
    console.log('Stopping here.');
    console.log('Script failed.');
    process.exit();
  });
