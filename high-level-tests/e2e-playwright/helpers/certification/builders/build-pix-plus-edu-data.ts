import { Knex } from 'knex';

import { CERTIFICATIONS_DATA } from '../../db-data.ts';

export async function buildPixPlusEduData(knex: Knex) {
  const [{ id: versionId }] = await knex('certification_versions')
    .insert({
      scope: CERTIFICATIONS_DATA.EDU_1ER_DEGRE,
      startDate: new Date('2024-10-19'),
      expirationDate: null,
      status: 'active',
      assessmentDuration: 120,
      minimumAnswersRequiredToValidateACertification: 20,
      globalScoringConfiguration: JSON.stringify([{ bounds: { max: 8, min: 3 }, meshLevel: 0 }]),
      competencesScoringConfiguration: JSON.stringify([]),
      challengesConfiguration: JSON.stringify({
        variationPercent: 0.3,
        maximumAssessmentLength: 32,
        defaultCandidateCapacity: -3,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: true,
        challengesBetweenSameCompetence: 2,
        defaultProbabilityToPickChallenge: 100,
      }),
    })
    .returning('id');

  const challenges = await knex('learningcontent.challenges')
    .whereRaw('?=ANY(??)', ['fr', 'locales'])
    .where('status', 'validé');

  const discriminantGenerator = generateBoundedValue(0.5, 1.5, 0.005);
  const difficultyGenerator = generateBoundedValue(-4.5, 6.8, 0.2);
  for (const challenge of challenges) {
    await knex('certification-frameworks-challenges').insert({
      challengeId: challenge.id,
      discriminant: discriminantGenerator.next().value,
      difficulty: difficultyGenerator.next().value,
      versionId,
    });
  }
}

function* generateBoundedValue(min: number, max: number, step: number) {
  let currentVal = min;
  while (true) {
    yield currentVal;
    currentVal = currentVal + step;
    if (currentVal > max) {
      currentVal = min;
    }
  }
}
