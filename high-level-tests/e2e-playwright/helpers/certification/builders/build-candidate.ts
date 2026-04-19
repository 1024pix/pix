import { Knex } from 'knex';

import { CERTIFICATIONS_DATA } from '../../db-data.ts';
import { createOrganizationLearnerInDb, createUserInDB } from '../../db-utils.ts';
import { PixCertifiableUserData } from '../types.ts';

export async function buildCandidate(knex: Knex, userData: PixCertifiableUserData): Promise<void> {
  const finalUserData = {
    ...userData,
    cgu: true,
    pixCertifTermsOfServiceAccepted: true,
    mustValidateTermsOfService: false,
  };
  await createUserInDB(finalUserData, knex);

  const organizationIds = await knex('organizations').pluck('id');
  for (const organizationId of organizationIds) {
    const organizationLearnerId = await createOrganizationLearnerInDb(
      {
        organizationId,
        userId: userData.id,
        firstName: finalUserData.firstName,
        lastName: finalUserData.lastName,
        birthdate: finalUserData.birthdate,
        birthCountryCode: '100',
        birthCity: finalUserData.birthCity,
        sex: finalUserData.sex,
      },
      knex,
    );

    await makeUserReadyForCleaAndCertifiable(knex, organizationId, userData.id, organizationLearnerId);
  }
}

async function makeUserReadyForCleaAndCertifiable(
  knex: Knex,
  organizationId: number,
  userId: number,
  organizationLearnerId: number,
) {
  const [campaignId] = await knex('campaigns').pluck('id').where({ organizationId });
  const skillIds = await knex('campaign_skills').pluck('skillId').where({ campaignId });
  const [{ id: campaignParticipationId }] = await knex('campaign-participations')
    .insert({
      campaignId,
      sharedAt: new Date(),
      userId,
      validatedSkillsCount: skillIds.length,
      isImproved: false,
      masteryRate: 1,
      pixScore: 875,
      status: 'SHARED',
      organizationLearnerId,
      isCertifiable: true,
    })
    .returning('id');
  const [badgeId] = await knex('badges').pluck('id').where({ key: CERTIFICATIONS_DATA.CLEA });
  await knex('badge-acquisitions').insert({
    userId,
    campaignParticipationId,
    badgeId,
  });
  const keData = [];
  const skillData = await knex('learningcontent.skills').select(['id', 'competenceId', 'pixValue']);
  const skillMap = new Map(skillData.map((s) => [s.id, { competenceId: s.competenceId, earnedPix: s.pixValue }]));
  for (const skillId of skillIds) {
    keData.push({
      source: 'direct',
      status: 'validated',
      skillId,
      earnedPix: skillMap.get(skillId)?.earnedPix,
      userId,
      competenceId: skillMap.get(skillId)?.competenceId,
    });
  }
  await knex('knowledge-elements').insert(keData);
}
