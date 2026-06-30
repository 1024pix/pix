import { Knex } from 'knex';

const competencesScoringValues = [
  { bounds: { max: -2, min: -9007199254740991 }, competenceLevel: 0 },
  { bounds: { max: -1, min: -2 }, competenceLevel: 1 },
  { bounds: { max: 0.5, min: -1 }, competenceLevel: 2 },
  { bounds: { max: 1, min: 0.5 }, competenceLevel: 3 },
  { bounds: { max: 2, min: 1 }, competenceLevel: 4 },
  { bounds: { max: 3, min: 2 }, competenceLevel: 5 },
  { bounds: { max: 4, min: 3 }, competenceLevel: 6 },
  { bounds: { max: 9007199254740991, min: 4 }, competenceLevel: 7 },
];

const competenceIndexes = [
  '1.1',
  '1.2',
  '1.3',
  '2.1',
  '2.2',
  '2.3',
  '2.4',
  '3.1',
  '3.2',
  '3.3',
  '3.4',
  '4.1',
  '4.2',
  '4.3',
  '5.1',
  '5.2',
];

export async function buildCoreVersion(knex: Knex) {
  const competences = await knex('learningcontent.competences').select('id', 'index').where('origin', 'Pix');

  const competenceIdByIndex = new Map(competences.map(({ id, index }: { id: string; index: string }) => [index, id]));

  const competencesScoringConfiguration = competenceIndexes.map((competenceIndex) => ({
    competenceId: competenceIdByIndex.get(competenceIndex),
    values: competencesScoringValues,
  }));

  const [{ id: versionId }] = await knex('certification_versions')
    .insert({
      scope: 'CORE',
      startDate: new Date('2024-10-19'),
      expirationDate: null,
      status: 'active',
      assessmentDuration: 120,
      minimumAnswersRequiredToValidateACertification: 20,
      globalScoringConfiguration:
        '[{"bounds": {"max": -1.4, "min": -8}, "meshLevel": 0}, {"bounds": {"max": -0.519, "min": -1.4}, "meshLevel": 1}, {"bounds": {"max": 0.6, "min": -0.519}, "meshLevel": 2}, {"bounds": {"max": 1.5, "min": 0.6}, "meshLevel": 3}, {"bounds": {"max": 2.25, "min": 1.5}, "meshLevel": 4}, {"bounds": {"max": 3.1, "min": 2.25}, "meshLevel": 5}, {"bounds": {"max": 4, "min": 3.1}, "meshLevel": 6}, {"bounds": {"max": 8, "min": 4}, "meshLevel": 7}]',
      competencesScoringConfiguration: JSON.stringify(competencesScoringConfiguration),
      challengesConfiguration: JSON.stringify({
        maximumAssessmentLength: 32,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: true,
        variationPercent: 0.5,
        defaultCandidateCapacity: -3,
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
