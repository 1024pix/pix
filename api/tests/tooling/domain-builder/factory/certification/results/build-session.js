import { Session } from '../../../../../../src/certification/results/domain/models/Session.ts';

export function buildSession({ id = 1, certificationIds = [2] } = {}) {
  return new Session({ id, certificationIds });
}
