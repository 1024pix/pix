import { SessionForResultsSharing } from '../../../../../../src/certification/results/domain/read-models/SessionForResultsSharing.js';

export function buildSessionForResultsSharing({
  id = 1,
  date = '2021-01-01',
  time = '14:30:00',
  certificationCenter = 'Centre de certif',
} = {}) {
  return new SessionForResultsSharing({ id, date, time, certificationCenter });
}
