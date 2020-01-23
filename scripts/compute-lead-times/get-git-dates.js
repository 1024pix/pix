const bluebird = require('bluebird');
const exec = bluebird.promisify(require('child_process').exec);

async function getCommitDatesBetweenTags(olderTag, newerTag) {
  const commitDates = await exec(`git log --no-merges --pretty=format:"%ad" ${olderTag}...${newerTag} | tail -n +2`);
  return commitDates.split('\n');
}

async function getTagDate(tag) {
  return exec(`git show --pretty=format:"%ad" --summary ${tag} | tail -1`);
}

async function getRefNames(maxCount = 6) {
  const refs = await exec(`git for-each-ref --format="%(refname)" --sort=-taggerdate --count=${maxCount} refs/tags`)
  return refs.replace(/refs\/tags\//gi, '').split('\n');
}

module.exports = {
  getCommitDatesBetweenTags,
  getTagDate,
  getRefNames
};
