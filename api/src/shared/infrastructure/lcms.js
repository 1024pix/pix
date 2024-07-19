import { httpAgent } from '../../../lib/infrastructure/http/http-agent.js';
import { config } from '../config.js';
import { logger } from './utils/logger.js';

const { lcms: lcmsConfig } = config;
const getLatestRelease = async function () {
  let signature;
  // eslint-disable-next-line n/no-process-env
  if (process.env.APP) {
    // eslint-disable-next-line n/no-process-env
    signature = `${process.env.APP}-${process.env.CONTAINER}@${process.env.REGION_NAME}`;
  } else {
    signature = 'pix-api';
  }

  const response = await httpAgent.get({
    url: lcmsConfig.url + '/releases/latest',
    headers: { Authorization: `Bearer ${lcmsConfig.apiKey}`, Referer: signature },
  });

  if (!response.isSuccessful) {
    throw new Error(`An error occurred while fetching ${lcmsConfig.url}`);
  }

  const version = response.data.id;
  const createdAt = response.data.createdAt;
  const message = `Release ${version} created on ${createdAt} successfully received from LCMS`;

  logger.info(message);
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
