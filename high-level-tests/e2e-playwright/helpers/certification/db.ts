import { knex } from '../db.ts';
import { PIX_CERTIF_PRO_DATA, PIX_CERTIF_SCO_DATA } from '../db-data.ts';
import {
  buildCandidates,
  buildCleaData,
  buildCoreVersion,
  buildCpfData,
  buildPixCertifUser,
  buildPixPlusDroitData,
  buildPixPlusEduData,
  buildPixPlusProSanteData,
} from './builders/index.ts';

export async function buildCertificationData() {
  // Use a PG mutex to solve the shard concurrency
  // This data should only be inserted once
  await knex.raw('SELECT pg_advisory_lock(12345)');
  const res = await knex('certification_versions').pluck('id');
  if (res.length > 0) {
    return;
  }
  await buildCpfData(knex);
  await buildCoreVersion(knex);
  const cleaTargetProfileId = await buildCleaData(knex);
  await buildPixPlusEduData(knex);
  await buildPixPlusDroitData(knex);
  await buildPixPlusProSanteData(knex);
  await buildPixCertifUser(knex, PIX_CERTIF_PRO_DATA, cleaTargetProfileId);
  const organizationId = await buildPixCertifUser(knex, PIX_CERTIF_SCO_DATA, cleaTargetProfileId);
  await buildCandidates(knex, organizationId);
}

export async function changeCandidateAnswers(certificationId: number, rightWrongAnswersPattern: boolean[]) {
  const answerIds = await knex
    .from('assessments')
    .join('answers', 'answers.assessmentId', 'assessments.id')
    .where('assessments.certificationCourseId', certificationId)
    .orderBy('answers.createdAt', 'ASC')
    .pluck('answers.id');

  for (const [i, answerId] of answerIds.entries()) {
    const nextResult = rightWrongAnswersPattern[i % rightWrongAnswersPattern.length] ? 'ok' : 'ko';
    await knex('answers').update('result', nextResult).where('answers.id', answerId);
  }
}
