const { Octokit } = require('@octokit/rest');

async function isDraftPullRequest() {
  const octokit = new Octokit();

  const pull_number = process.env.CIRCLE_PULL_REQUEST.split('/').slice(-1)[0];
  const { data } = await octokit.pulls.get({
    owner: process.env.CIRCLE_PROJECT_USERNAME,
    repo: process.env.CIRCLE_PROJECT_REPONAME,
    pull_number,
  });
  return data.draft;
}

isDraftPullRequest().then((isDraft) => {
  if (isDraft) {
    console.log('PR is not ready for review - failing build');
    process.exit(1);
  }
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
