import 'dotenv/config';

import { readFile } from 'node:fs/promises';

import Redis from 'ioredis';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const { challengeIdsFile, redisUrl } = yargs(hideBin(process.argv)).argv;
const rawChallengeIdsFile = await readFile(challengeIdsFile, 'utf-8');
const challengeIds = rawChallengeIdsFile.split('\n').filter((challengeId) => challengeId);

const REDIS_URL = redisUrl || process.env.REDIS_URL;
const redisClient = new Redis(REDIS_URL);
const rawLearningContent = await redisClient.get('cache:LearningContent');
const learningContent = JSON.parse(rawLearningContent);
await redisClient.quit();

const challenges = challengeIds.map((challengeId) => learningContent.challenges.find(({ id }) => challengeId === id));
const difficulties = challenges.map(({ delta }) => delta);

difficulties.forEach((difficulty) => console.log(`${difficulty}`.replace('.', ',')));
