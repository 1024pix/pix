import { knex } from '../db.ts';
import { PIX_CERTIF_PRO_DATA } from '../db-data.ts';
import {
  buildCertifiableUsers,
  buildCleaData,
  buildCoreVersion,
  buildCpfData,
  buildPixCertifUser,
  buildPixPlusDroitData,
  buildPixPlusEduData,
  buildPixPlusProSanteData,
} from './builders/index.ts';

export async function buildCertificationData() {
  await buildCpfData(knex);
  await buildCoreVersion(knex);
  await buildCleaData(knex);
  await buildPixPlusEduData(knex);
  await buildPixPlusDroitData(knex);
  await buildPixPlusProSanteData(knex);
  await buildPixCertifUser(knex, PIX_CERTIF_PRO_DATA);
  const organizationId = await buildPixCertifUser(knex, PIX_CERTIF_PRO_DATA);
  await buildCertifiableUsers(knex, organizationId);
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
