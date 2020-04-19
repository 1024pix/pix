const Queue = require('bull');
const config = require('../../config');
const logger = require('../logger');

const sendEmailJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000 * 60,
  },
  removeOnComplete: true,
  removeOnFail: 1,
};

function createSendEmailQueue(sendEmailProcessorName) {
  const sendEmailQueue = new Queue('send-email-queue', config.scheduledJobs.redisUrl);
  sendEmailQueue.on('error', (err) => logger.error(`Creating send email queue failed: ${err}`));
  sendEmailQueue.process(sendEmailProcessorName);
  return sendEmailQueue;
}

module.exports = { createSendEmailQueue, sendEmailJobOptions };
