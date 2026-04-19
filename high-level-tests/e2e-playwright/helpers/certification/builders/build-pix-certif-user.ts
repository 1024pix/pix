import { Knex } from 'knex';

import { createOrganizationInDB, createOrganizationMembershipInDB } from '../../db.ts';
import {
  createCertificationCenterHabilitationInDB,
  createCertificationCenterInDB,
  createCertificationCenterMembershipInDB,
  createUserInDB,
} from '../../db-utils.ts';
import { PixCertifUserData } from '../types.ts';

const CLEA_SKILLS_CACHE: string[] = [];

export async function buildPixCertifUser(knex: Knex, userData: PixCertifUserData, cleaTargetProfileId: number) {
  let organizationId;
  const certificationUserId = await createUserInDB(
    {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      rawPassword: userData.rawPassword,
      cgu: true,
      pixCertifTermsOfServiceAccepted: true,
      mustValidateTermsOfService: false,
      id: userData.id,
    },
    knex,
  );
  for (const certificationCenter of userData.certificationCenters) {
    const certificationCenterId = await createCertificationCenterInDB(
      {
        type: certificationCenter.type,
        externalId: certificationCenter.externalId,
      },
      knex,
    );
    await createCertificationCenterMembershipInDB({ userId: certificationUserId, certificationCenterId }, knex);
    for (const habilitationKey of certificationCenter.habilitations) {
      await createCertificationCenterHabilitationInDB({ certificationCenterId, key: habilitationKey }, knex);
    }
    if (certificationCenter.withOrganization) {
      const { id: legalDocumentVersionId } = await knex('legal-document-versions').select('id').first();
      const someDate = new Date('2025-07-09');
      await knex('legal-document-version-user-acceptances').insert({
        legalDocumentVersionId,
        userId: certificationUserId,
        acceptedAt: someDate,
      });
      organizationId = await createOrganizationInDB({
        type: certificationCenter.type,
        externalId: certificationCenter.externalId,
        isManagingStudents: certificationCenter.withOrganization.isManagingStudents,
      });
      await createOrganizationMembershipInDB(certificationUserId, organizationId, 'MEMBER');
      const allTargetProfileIds = await knex('target-profiles').pluck('id');
      for (const targetProfileId of allTargetProfileIds) {
        await knex('target-profile-shares').insert({ targetProfileId, organizationId });
      }
      await createCleaCampaign(knex, organizationId, certificationUserId, cleaTargetProfileId);
    }
  }
  return organizationId;
}

async function createCleaCampaign(knex: Knex, organizationId: number, userId: number, cleaTargetProfileId: number) {
  const [{ id: campaignId }] = await knex('campaigns')
    .insert({
      name: 'Campagne CLEA',
      code: `CLEACODE${organizationId}`,
      organizationId,
      creatorId: userId,
      targetProfileId: cleaTargetProfileId,
      type: 'ASSESSMENT',
      ownerId: userId,
    })
    .returning('id');

  if (CLEA_SKILLS_CACHE.length === 0) {
    const targetProfileTubes = await knex('target-profile_tubes').select(['level', 'tubeId']).where({
      targetProfileId: cleaTargetProfileId,
    });
    for (const { level, tubeId } of targetProfileTubes) {
      const skillIdsForTube = await knex('learningcontent.skills')
        .pluck('id')
        .where({ tubeId })
        .andWhere('level', '<=', level);
      CLEA_SKILLS_CACHE.push(...skillIdsForTube);
    }
  }
  await knex('campaign_skills').insert(CLEA_SKILLS_CACHE.map((skillId) => ({ skillId, campaignId })));
}
