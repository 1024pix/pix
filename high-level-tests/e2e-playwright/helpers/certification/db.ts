import { knex } from '../db.ts';
import { PIX_ADMIN_CERTIF_DATA, PIX_CERTIF_PRO_DATA, PIX_CERTIF_SCO_DATA } from '../db-data.ts';
import {
  buildCandidates,
  buildCleaData,
  buildCoreVersion,
  buildCpfData,
  buildPixAdminUser,
  buildPixCertifUser,
  buildPixPlusDroitData,
  buildPixPlusEduData,
  buildPixPlusProSanteData,
} from './builders/index.ts';
import { PixAdminUserData } from './types.ts';

export async function buildCertificationData() {
  await buildCpfData(knex);
  await buildCoreVersion(knex);
  const cleaTargetProfileId = await buildCleaData(knex);
  await buildPixPlusEduData(knex);
  await buildPixPlusDroitData(knex);
  await buildPixPlusProSanteData(knex);
  await buildPixCertifUser(knex, PIX_CERTIF_PRO_DATA, cleaTargetProfileId);
  const organizationId = await buildPixCertifUser(knex, PIX_CERTIF_SCO_DATA, cleaTargetProfileId);
  await buildCandidates(knex, organizationId);
  await buildPixAdminUser(knex, PIX_ADMIN_CERTIF_DATA as PixAdminUserData);
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
