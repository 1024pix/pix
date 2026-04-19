import { Knex } from 'knex';

import { CERTIFICATIONS_DATA } from '../../db-data.ts';
import { createOrganizationLearnerInDb, createUserInDB } from '../../db-utils.ts';
import { pixCertifiableUserData } from '../data.ts';

export async function buildCandidates(knex: Knex, organizationId: number): Promise<void> {
  let userId = 1_000_000_000;
  for (const userData of pixCertifiableUserData) {
    const finalUserData = {
      ...userData,
      id: userId,
      email: `pix-app-user-${userId}-0@example.net`,
      cgu: true,
      pixCertifTermsOfServiceAccepted: true,
      mustValidateTermsOfService: false,
    };
    await createUserInDB(finalUserData, knex);

    const organizationLearnerId = await createOrganizationLearnerInDb(
      {
        organizationId,
        userId,
        firstName: finalUserData.firstName,
        lastName: finalUserData.lastName,
        birthdate: finalUserData.birthdate,
        birthCountryCode: '100',
        birthCity: finalUserData.birthCity,
        sex: finalUserData.sex,
      },
      knex,
    );

    await makeUserReadyForCleaAndCertifiable(knex, organizationId, userId, organizationLearnerId);

    userId++;
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
