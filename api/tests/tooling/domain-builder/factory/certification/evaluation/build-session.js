import { Session } from '../../../../../../src/certification/evaluation/domain/models/Session.js';

const buildSession = function ({ id = 123, isFinalized = false, isPublished = false } = {}) {
  return new Session({
    id,
    finalizedAt: isFinalized ? new Date('2020-01-01') : null,
    publishedAt: isPublished ? new Date('2020-01-01') : null,
  });
};

buildSession.finalized = ({ id = 123 } = {}) => {
  return new Session({
    id,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
  });
};

buildSession.published = ({ id = 123 } = {}) => {
  return new Session({
    id,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: new Date('2020-01-01'),
  });
};

buildSession.ongoing = ({ id = 123 } = {}) => {
  return new Session({
    id,
    finalizedAt: null,
    publishedAt: null,
  });
};

export { buildSession };
