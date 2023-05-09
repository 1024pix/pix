import { httpAgent } from './http/http-agent.js';
import { lcms } from '../config.js';

const getLatestRelease = async function () {
  const response = await httpAgent.get({
    url: lcms.url + '/releases/latest',
    headers: { Authorization: `Bearer ${lcms.apiKey}` },
  });

  if (!response.isSuccessful) {
    throw new Error(`An error occurred while fetching ${lcms.url}`);
  }

  return response.data.content;
};

const createRelease = async function () {
  const response = await httpAgent.post({
    url: lcms.url + '/releases',
    headers: { Authorization: `Bearer ${lcms.apiKey}` },
  });
  return response.data.content;
};

export { getLatestRelease, createRelease };
