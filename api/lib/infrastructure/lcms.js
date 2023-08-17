import { config } from '../config.js';
import { httpAgent } from './http/http-agent.js';

const { lcms: lcmsConfig } = config;
const getLatestRelease = async function () {
  const response = await httpAgent.get({
    url: lcmsConfig.url + '/releases/latest',
    headers: { Authorization: `Bearer ${lcmsConfig.apiKey}` },
  });

  if (!response.isSuccessful) {
    throw new Error(`An error occurred while fetching ${lcmsConfig.url}`);
  }

  return response.data.content;
};

const createRelease = async function () {
  const response = await httpAgent.post({
    url: lcmsConfig.url + '/releases',
    headers: { Authorization: `Bearer ${lcmsConfig.apiKey}` },
  });
  return response.data.content;
};

const lcms = { getLatestRelease, createRelease };

export { lcms };
