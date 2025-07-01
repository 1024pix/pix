import { config } from '../config.js';
import { httpAgent } from './http-agent.js';
import { logger } from './utils/logger.js';

const { lcms: lcmsConfig } = config;
const getRelease = async function () {
  let signature;

  if (process.env.APP) {
    signature = `${process.env.APP}-${process.env.CONTAINER}@${process.env.REGION_NAME}`;
  } else {
    signature = 'pix-api';
  }

  const url = lcmsConfig.url + '/releases/' + (lcmsConfig.releaseId ?? 'latest');
  const response = await httpAgent.get({
    url,
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

  if (!response.isSuccessful) {
    logger.error(`An error occurred while creating a release on ${lcmsConfig.url}: ${JSON.stringify(response)}`);
    throw new Error(`An error occurred while creating a release on ${lcmsConfig.url}`);
  }

  return response.data.content;
};

const lcmsClient = { getRelease, createRelease };

export { lcmsClient };
