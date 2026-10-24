import { SessionSummary } from '../../../../src/certification/session-management/domain/read-models/SessionSummary.js';
import {
  SESSION_STATUSES,
  SessionStatus,
} from '../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';

const buildSessionSummary = function ({
  id = 123,
  address = '4 avenue du général perlimpimpim',
  room = '28D',
  date = '2021-01-01',
  time = '14:30',
  examiner = 'Flute',
  enrolledCandidatesCount = 5,
  effectiveCandidatesCount = 4,
  sessionStatus,
} = {}) {
  const finalSessionStatus = sessionStatus ? sessionStatus : new SessionStatus({ status: SESSION_STATUSES.CREATED });
  return new SessionSummary({
    id,
    address,
    room,
    date,
    time,
    examiner,
    enrolledCandidatesCount,
    effectiveCandidatesCount,
    sessionStatus: finalSessionStatus,
  });
};

buildSessionSummary.created = function ({
  id,
  address,
  room,
  date,
  time,
  examiner,
  enrolledCandidatesCount,
  effectiveCandidatesCount,
}) {
  return buildSessionSummary({
    id,
    address,
    room,
    date,
    time,
    examiner,
    enrolledCandidatesCount,
    effectiveCandidatesCount,
    sessionStatus: new SessionStatus({ status: SESSION_STATUSES.CREATED }),
  });
};

buildSessionSummary.finalized = function ({
  id,
  address,
  room,
  date,
  time,
  examiner,
  enrolledCandidatesCount,
  effectiveCandidatesCount,
}) {
  return buildSessionSummary({
    id,
    address,
    room,
    date,
    time,
    examiner,
    enrolledCandidatesCount,
    effectiveCandidatesCount,
    sessionStatus: new SessionStatus({ status: SESSION_STATUSES.FINALIZED }),
  });
};

buildSessionSummary.processed = function ({
  id,
  address,
  room,
  date,
  time,
  examiner,
  enrolledCandidatesCount,
  effectiveCandidatesCount,
}) {
  return buildSessionSummary({
    id,
    address,
    room,
    date,
    time,
    examiner,
    enrolledCandidatesCount,
    effectiveCandidatesCount,
    sessionStatus: new SessionStatus({ status: SESSION_STATUSES.PROCESSED }),
  });
};

export { buildSessionSummary };
