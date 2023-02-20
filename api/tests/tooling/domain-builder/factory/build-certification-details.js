import CertificationDetails from '../../../../lib/domain/read-models/CertificationDetails';
import { states } from '../../../../lib/domain/models/CertificationAssessment';

export default function buildCertificationDetails({
  id = 123,
  userId = 456,
  createdAt = new Date('2020-01-01'),
  completedAt = new Date('2020-03-03'),
  status = states.COMPLETED,
  totalScore = 555,
  percentageCorrectAnswers = 75,
  competencesWithMark = [
    {
      areaCode: '1',
      id: 'recComp1',
      index: '1.1',
      name: 'manger des fruits',
      obtainedLevel: 1,
      obtainedScore: 9,
      positionedLevel: 2,
      positionedScore: 17,
    },
  ],
  listChallengesAndAnswers = [
    {
      challengeId: 'recChal1',
      competence: '1.1',
      result: 'ok',
      skill: 'manger une mangue',
      value: 'miam',
    },
  ],
} = {}) {
  return new CertificationDetails({
    id,
    userId,
    createdAt,
    completedAt,
    status,
    totalScore,
    percentageCorrectAnswers,
    competencesWithMark,
    listChallengesAndAnswers,
  });
}
