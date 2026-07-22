import { Knex } from 'knex';

export async function buildVersionTubes(knex: Knex, versionId: number) {
  const tubeRows: { tubeId: string }[] = await knex('certification-frameworks-challenges')
    .distinct()
    .select({ tubeId: 'learningcontent.skills.tubeId' })
    .join(
      'learningcontent.challenges',
      'learningcontent.challenges.id',
      'certification-frameworks-challenges.challengeId',
    )
    .join('learningcontent.skills', 'learningcontent.skills.id', 'learningcontent.challenges.skillId')
    .where('certification-frameworks-challenges.versionId', versionId);

  if (tubeRows.length === 0) {
    return;
  }

  await knex('certification_versions_tubes').insert(
    tubeRows.map(({ tubeId }) => ({ tube_id: tubeId, version_id: versionId })),
  );
}
