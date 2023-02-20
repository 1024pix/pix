import SessionSummary from '../../../../lib/domain/read-models/SessionSummary';

const buildSessionSummary = function ({
  id = 123,
  address = '4 avenue du général perlimpimpim',
  room = '28D',
  date = '2021-01-01',
  time = '14:30',
  examiner = 'Flute',
  enrolledCandidatesCount = 5,
  effectiveCandidatesCount = 4,
  status = SessionSummary.statuses.CREATED,
} = {}) {
  return new SessionSummary({
    id,
    address,
    room,
    date,
    time,
    examiner,
    enrolledCandidatesCount,
    effectiveCandidatesCount,
    status,
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
    status: SessionSummary.statuses.CREATED,
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
    status: SessionSummary.statuses.FINALIZED,
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
    status: SessionSummary.statuses.PROCESSED,
  });
};

export default buildSessionSummary;
