require('dotenv').config();
const scalingo = require('scalingo');
const axios = require('axios');
const SUCCESSFUL_EXIT_CODE = 0;
const FAIL_EXIT_CODE = 0;
const tenSeconds = 10 * 1000;

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const deployRelease = async function() {

  let currentAPIVersion;

  const apiUrl = process.env.TARGET_API_URL;
  const getAPIVersionRequestUrl = process.env.TARGET_API_URL + '/api';
  const apiApplicationName =  process.env.TARGET_API_APPLICATION_NAME;
  const releaseTag = process.env.RELEASE_TAG;
  const expectedAPIVersion = releaseTag;
  const scalingoToken = process.env.SCALINGO_TOKEN;
  const gitHubToken = process.env.GITHUB_TOKEN;

  try {
    currentAPIVersion = 'v' + (await axios.get(getAPIVersionRequestUrl)).data.version;
  } catch (error) {
    console.error(`API cannot be reached on URL ${getAPIVersionRequestUrl}, exiting..`);
    process.exit(FAIL_EXIT_CODE);
  }

  console.info(`Current API version: ${currentAPIVersion}`);

  if (currentAPIVersion === expectedAPIVersion) {
    console.info(`API is already in expected version: ${expectedAPIVersion}`);
    console.info('Nothing to do, exiting..');
    process.exit(SUCCESSFUL_EXIT_CODE);
  }

  const client = await scalingo.clientFromToken(scalingoToken, { apiUrl });

  //const user = await client.Users.self();
  // console.info(`Connected as ${user.username}`);

  const releaseArchiveUrl = `https://${gitHubToken}@github.com/1024pix/pix/archive/${releaseTag}.tar.gz`;

  try {
    await client.apiClient().post(
      `https://api-osc-fr1.scalingo.com/v1/apps/${apiApplicationName}/deployments`,
      {
        deployment: {
          git_ref: releaseTag,
          source_url: releaseArchiveUrl,
        },
      });
  } catch (error)
  {
    console.error('Deployment request failed, exiting');
    console.dir(error);
    process.exit(FAIL_EXIT_CODE);
  }

  console.info(`Deployment successfully asked for release ${releaseTag} on ${apiApplicationName}`);
  console.info('Waiting for deployment to complete...');

  while (currentAPIVersion !== expectedAPIVersion) {
    await wait(tenSeconds);
    currentAPIVersion = 'v' + (await axios.get(getAPIVersionRequestUrl)).data.version;
    console.info(`Current API version: ${currentAPIVersion}`);
  }

  console.info('Deployment completed');

};

// (async function main() {
//   await deployRelease();
// })();

module.exports = {
  deployRelease,
};
