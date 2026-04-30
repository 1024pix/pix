import { Session } from '../../../../../../src/certification/evaluation/domain/models/Session.js';

const buildSession = function ({
  id = 123,
  date = '2024-08-05',
  time = '10:02:00',
  accessCode = 'FMKP39',
  isFinalized = false,
  isPublished = false,
  hasStarted = false,
} = {}) {
  return new Session({
    id,
    date,
    time,
    accessCode,
    hasStarted,
    finalizedAt: isFinalized ? new Date('2020-01-01') : null,
    publishedAt: isPublished ? new Date('2020-01-01') : null,
  });
};

buildSession.finalized = ({ id = 123, date = '2024-08-05', time = '10:02:00', accessCode = 'FMKP39' } = {}) => {
  return new Session({
    id,
    date,
    time,
    accessCode,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: null,
    hasStarted: true,
  });
};

buildSession.published = ({ id = 123, date = '2024-08-05', time = '10:02:00', accessCode = 'FMKP39' } = {}) => {
  return new Session({
    id,
    date,
    time,
    accessCode,
    finalizedAt: new Date('2020-01-01'),
    publishedAt: new Date('2020-01-01'),
    hasStarted: true,
  });
};

buildSession.ongoing = ({
  id = 123,
  date = '2024-08-05',
  time = '18:32:00',
  accessCode = 'FMKP39',
  hasStarted = false,
} = {}) => {
  return new Session({
    id,
    date,
    time,
    accessCode,
    finalizedAt: null,
    publishedAt: null,
    hasStarted,
  });
};

export { buildSession };
