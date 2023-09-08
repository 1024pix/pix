import yargs from 'yargs';
import { readFile } from 'fs/promises';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

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
