import Knex from 'knex';

// @ts-expect-error NON_OIDC_IDENTITY_PROVIDERS from API project
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../api/src/identity-access-management/domain/constants/identity-providers.js';
// @ts-expect-error AuthenticationMethod from API project
import { AuthenticationMethod } from '../../../api/src/identity-access-management/domain/models/AuthenticationMethod.js';
import { buildCoreVersion, buildCpfData, buildPixCertifUser } from './certification/builders/index.ts';
import {
  PIX_ADMIN_SUPPORT_DATA,
  PIX_APP_USER_DATA,
  PIX_CERTIF_PRO_DATA,
  PIX_ORGA_ADMIN_DATA,
  PIX_ORGA_MEMBER_DATA,
} from './db-data.js';
import {
  createCertificationCenterInDB,
  createCertificationCenterMembershipInDB,
  createOrganizationLearnerInDB,
  createUserInDB,
} from './db-utils.ts';

export const knex = Knex({ client: 'postgresql', connection: process.env.DATABASE_URL });

export async function buildStaticData() {
  const hasDataAlreadyBeenBuilt = await knex('users').select({ id: PIX_APP_USER_DATA.id }).first();
  if (!hasDataAlreadyBeenBuilt) {
    await buildAuthenticatedUsers();
    await buildTargetProfiles();
    await buildCpfData(knex);
    await buildCoreVersion(knex);
    await buildPixCertifUser(knex, PIX_CERTIF_PRO_DATA, null);
  }
}

export async function buildFreshPixAppUser(
  firstName: string,
  lastName: string,
  email: string,
  rawPassword: string,
  mustRevalidateCgu: boolean,
) {
  return createUserInDB(
    {
      firstName,
      lastName,
      email,
      rawPassword,
      cgu: true,
      pixCertifTermsOfServiceAccepted: false,
      mustValidateTermsOfService: mustRevalidateCgu,
      id: undefined,
    },
    knex,
  );
}

export async function buildExistingOrganizationLearner({
  firstName,
  lastName,
  nationalStudentId,
  email,
  birthdate,
  isDisabled,
  rawPassword,
  organizationId,
}: {
  firstName: string;
  lastName: string;
  birthdate?: string;
  nationalStudentId: string;
  email: string;
  isDisabled: boolean;
  rawPassword: string;
  organizationId: number;
}) {
  const userId = await createUserInDB(
    {
      firstName,
      lastName,
      email,
      rawPassword,
      cgu: true,
      pixCertifTermsOfServiceAccepted: false,
      mustValidateTermsOfService: false,
    },
    knex,
  );

  return await createOrganizationLearnerInDB(
    {
      firstName,
      lastName,
      nationalStudentId,
      birthdate,
      userId,
      isDisabled,
      organizationId,
    },
    knex,
  );
}

export async function buildFreshPixCertifUser(firstName: string, lastName: string, email: string, rawPassword: string) {
  const certificationCenterId = await createCertificationCenterInDB(
    { type: 'PRO', externalId: 'Certification center for ' + email },
    knex,
  );
  const userId = await createUserInDB(
    {
      firstName,
      lastName,
      email,
      rawPassword,
      cgu: false,
      pixCertifTermsOfServiceAccepted: false,
      mustValidateTermsOfService: false,
      id: undefined,
    },
    knex,
  );
  await createCertificationCenterMembershipInDB({ userId, certificationCenterId }, knex);
}

export async function buildFreshPixOrgaUser(
  firstName: string,
  lastName: string,
  email: string,
  rawPassword: string,
  role: string,
  organization: { type: string; externalId: string; isManagingStudents: boolean },
) {
  const organizationId = await createOrganizationInDB(organization);
  const userId = await createUserInDB(
    {
      firstName,
      lastName,
      email,
      rawPassword,
      cgu: false,
      pixCertifTermsOfServiceAccepted: false,
      mustValidateTermsOfService: false,
      id: undefined,
    },
    knex,
  );
  await createOrganizationMembershipInDB(userId, organizationId, role);

  const targetProfileIds = await knex('target-profiles').pluck('id');
  const targetProfileSharesToInsert = targetProfileIds.map((targetProfileId) => ({
    targetProfileId,
    organizationId,
  }));
  await knex('target-profile-shares').insert(targetProfileSharesToInsert);
  return { userId, targetProfileId: targetProfileIds[0], organizationId };
}

export async function buildFreshPixOrgaUserWithGenericImport(
  firstName: string,
  lastName: string,
  email: string,
  rawPassword: string,
  role: string,
  uid: string,
  organization: { type: string; externalId: string; isManagingStudents: boolean },
) {
  const organizationId = await createOrganizationInDB(organization);
  const userId = await createUserInDB(
    {
      firstName,
      lastName,
      email,
      rawPassword,
      cgu: true,
      pixCertifTermsOfServiceAccepted: false,
      mustValidateTermsOfService: false,
      id: undefined,
    },
    knex,
  );
  await createOrganizationMembershipInDB(userId, organizationId, role);

  const [targetProfileId] = await knex('target-profiles').pluck('id');
  await knex('target-profile-shares').insert({
    targetProfileId,
    organizationId,
  });

  // Create generic import format
  const importFormatConfig = {
    headers: [
      {
        name: 'Nom apprenant',
        config: {
          property: 'lastName',
          validate: { type: 'string', required: true },
          reconcile: { name: 'COMMON_LASTNAME', fieldId: 'reconcileField1', position: 1 },
        },
        required: true,
      },
      {
        name: 'Prénom apprenant',
        config: {
          property: 'firstName',
          validate: { type: 'string', required: true },
          reconcile: { name: 'COMMON_FIRSTNAME', fieldId: 'reconcileField2', position: 2 },
        },
        required: true,
      },
      {
        name: 'Classe',
        config: {
          validate: { type: 'string', required: true },
          exportable: true,
          displayable: { name: 'COMMON_DIVISION', position: 1, filterable: { type: 'string' } },
        },
        required: true,
      },
      {
        name: 'Date de naissance',
        config: {
          validate: { type: 'date', format: 'YYYY-MM-DD', required: true },
          reconcile: { name: 'COMMON_BIRTHDATE', fieldId: 'reconcileField3', position: 3 },
          displayable: { name: 'COMMON_BIRTHDATE', position: 2 },
        },
        required: true,
      },
    ],
    unicityColumns: ['Nom apprenant', 'Prénom apprenant', 'Date de naissance'],
    acceptedEncoding: ['utf8'],
  };

  const [{ id: importFormatId }] = await knex('organization-learner-import-formats')
    .insert({
      name: `GEN-${uid}`,
      fileType: 'csv',
      config: importFormatConfig,
      createdBy: userId,
    })
    .returning('id');

  const featureId = await knex('features')
    .where('key', 'LEARNER_IMPORT')
    .select('id')
    .first()
    .then((row) => row?.id);

  await knex('organization-features').insert({
    organizationId,
    featureId,
    params: { organizationLearnerImportFormatId: importFormatId },
  });

  // Create a campaign for this organization
  const campaignCode = uid.toUpperCase();
  const [{ id: campaignId }] = await knex('campaigns')
    .insert({
      name: 'Campaign for Generic Import',
      code: campaignCode,
      title: 'Test Generic Import Campaign',
      type: 'ASSESSMENT',
      createdAt: new Date(),
      organizationId,
      creatorId: userId,
      ownerId: userId,
      targetProfileId: targetProfileId,
      assessmentMethod: 'SMART_RANDOM',
      multipleSendings: false,
      isForAbsoluteNovice: false,
    })
    .returning('id');

  return { userId, targetProfileId, campaignCode, campaignId, organizationId };
}

export async function setAssessmentIdSequence(id: number) {
  const result = await knex.raw(`SELECT pg_get_serial_sequence(?, ?) AS sequence_name`, ['assessments', 'id']);
  const sequenceName = result.rows[0]?.sequence_name;
  await knex.raw(`SELECT setval(?, ??, false)`, [sequenceName, id]);
}

async function buildAuthenticatedUsers() {
  // PIX-APP
  await createUserInDB(
    {
      firstName: PIX_APP_USER_DATA.firstName,
      lastName: PIX_APP_USER_DATA.lastName,
      email: PIX_APP_USER_DATA.email,
      rawPassword: PIX_APP_USER_DATA.rawPassword,
      cgu: true,
      pixCertifTermsOfServiceAccepted: true,
      mustValidateTermsOfService: false,
      id: PIX_APP_USER_DATA.id,
    },
    knex,
  );

  // PIX-ORGA
  const legalDocumentVersionId = await createLegalDocumentVersionInDB();
  const createdOrganizations: Record<string, number> = {};
  for (const data of [PIX_ORGA_ADMIN_DATA, PIX_ORGA_MEMBER_DATA]) {
    const userId = await createUserInDB(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        rawPassword: data.rawPassword,
        cgu: true,
        pixCertifTermsOfServiceAccepted: true,
        mustValidateTermsOfService: false,
        id: data.id,
      },
      knex,
    );
    await createLegalDocumentVersionAcceptanceInDB(legalDocumentVersionId, userId);

    for (const organization of data.organizations) {
      if (!createdOrganizations[organization.externalId]) {
        createdOrganizations[organization.externalId] = await createOrganizationInDB(organization);
      }
      await createOrganizationMembershipInDB(userId, createdOrganizations[organization.externalId], data.role);
    }
  }

  const admiUserId = await createUserInDB(
    {
      firstName: PIX_ADMIN_SUPPORT_DATA.firstName,
      lastName: PIX_ADMIN_SUPPORT_DATA.lastName,
      email: PIX_ADMIN_SUPPORT_DATA.email,
      rawPassword: PIX_ADMIN_SUPPORT_DATA.rawPassword,
      cgu: true,
      pixCertifTermsOfServiceAccepted: true,
      mustValidateTermsOfService: false,
      id: PIX_ADMIN_SUPPORT_DATA.id,
    },
    knex,
  );
  await knex('pix-admin-roles').insert({ userId: admiUserId, role: PIX_ADMIN_SUPPORT_DATA.role });
}

async function buildTargetProfiles() {
  const tubeDTOs: { competenceId: string; tubeId: string }[] = await knex('learningcontent.tubes')
    .distinct()
    .select({
      competenceId: 'learningcontent.competences.id',
      tubeId: 'learningcontent.tubes.id',
    })
    .join('learningcontent.competences', 'learningcontent.tubes.competenceId', 'learningcontent.competences.id')
    .join('learningcontent.skills', 'learningcontent.skills.tubeId', 'learningcontent.tubes.id')
    .join('learningcontent.challenges', 'learningcontent.challenges.skillId', 'learningcontent.skills.id')
    .where('learningcontent.competences.origin', '=', 'Pix')
    .where('learningcontent.skills.status', 'actif')
    .where(
      (queryBuilder: {
        whereRaw: (arg0: string, arg1: string[]) => void;
        orWhereRaw: (arg0: string, arg1: string[]) => void;
      }) => {
        queryBuilder.whereRaw('? = ANY(learningcontent.challenges.locales)', ['fr']);
        queryBuilder.orWhereRaw('? = ANY(learningcontent.challenges.locales)', ['fr-fr']);
      },
    )
    .orderBy('learningcontent.tubes.id');
  const tubesByCompetenceId: Record<string, { competenceId: string; tubeId: string }[]> = Object.groupBy(
    tubeDTOs,
    (tubeDTO: { competenceId: string }) => tubeDTO.competenceId,
  ) as Record<string, { competenceId: string; tubeId: string }[]>;
  const tubesForBigTargetProfileIds = [];
  for (const tubesForCompetence of Object.values(tubesByCompetenceId)) {
    if (!tubesForCompetence) continue;
    tubesForBigTargetProfileIds.push(...tubesForCompetence.slice(0, 2).map((tubeDTO) => tubeDTO.tubeId));
  }
  const bigTargetProfileId = await createTargetProfileInDB('PC pour Playwright');
  await createTargetProfileTubesInDB(bigTargetProfileId, 3, tubesForBigTargetProfileIds);

  const tubeForSmallTargetProfileId = [tubesForBigTargetProfileIds[0]];
  const smallTargetProfileId = await createTargetProfileInDB('petit Profile Cible');
  await createTargetProfileTubesInDB(smallTargetProfileId, 4, tubeForSmallTargetProfileId);
}

async function createLegalDocumentVersionInDB() {
  const someDate = new Date('2025-07-09');
  const [{ id }] = await knex('legal-document-versions')
    .insert({
      type: 'TOS',
      service: 'pix-orga',
      versionAt: someDate,
    })
    .returning('id');
  return id;
}

export async function createOrganizationInDB({
  type,
  externalId,
  isManagingStudents,
}: {
  type: string;
  externalId: string;
  isManagingStudents: boolean;
}) {
  const someDate = new Date();
  const administrationTeamId = await knex('administration_teams')
    .insert({
      name: `Team for ${externalId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning('id')
    .then((rows) => rows[0].id);

  const organizationLearnerTypeId = await knex('organization_learner_types')
    .insert({
      name: `Type for ${externalId}`,
    })
    .returning('id')
    .then((rows) => rows[0].id);

  const [{ id }] = await knex('organizations')
    .insert({
      type,
      name: `Orga ${type.toLowerCase()}`,
      logoUrl: null,
      externalId,
      provinceCode: '66',
      isManagingStudents,
      credit: 0,
      createdAt: someDate,
      updatedAt: someDate,
      email: 'contact@example.net',
      documentationUrl: null,
      createdBy: null,
      showNPS: false,
      formNPSUrl: null,
      showSkills: false,
      archivedBy: null,
      archivedAt: null,
      identityProviderForCampaigns: null,
      parentOrganizationId: null,
      administrationTeamId,
      countryCode: 99100,
      organizationLearnerTypeId,
    })
    .returning('id');
  return id;
}

export async function createOrganizationMembershipInDB(userId: number, organizationId: number, role: string) {
  const someDate = new Date();
  await knex('memberships').insert({
    organizationId,
    organizationRole: role,
    userId,
    createdAt: someDate,
    updatedAt: someDate,
    disabledAt: null,
    updatedByUserId: null,
    lastAccessedAt: someDate,
  });
}

async function createLegalDocumentVersionAcceptanceInDB(legalDocumentVersionId: number, userId: number) {
  const someDate = new Date('2025-07-09');
  await knex('legal-document-version-user-acceptances').insert({
    legalDocumentVersionId,
    userId,
    acceptedAt: someDate,
  });
}

export async function createTargetProfileInDB(name: string) {
  const someDate = new Date();
  const [{ id }] = await knex('target-profiles')
    .insert({
      name,
      internalName: name,
      imageUrl: null,
      isSimplifiedAccess: false,
      createdAt: someDate,
      outdated: false,
      description: null,
      comment: null,
      category: 'OTHER',
      migration_status: 'N/A',
      areKnowledgeElementsResettable: false,
    })
    .returning('id');

  const organizationIds = await knex('organizations').pluck('id');
  const targetProfileSharesToInsert = organizationIds.map((organizationId) => ({
    targetProfileId: id,
    organizationId,
  }));
  if (targetProfileSharesToInsert.length > 0) {
    await knex('target-profile-shares').insert(targetProfileSharesToInsert);
  }
  return id;
}

export async function createCombinedCourseBlueprintInDB(name: string) {
  const someDate = new Date();
  const [{ id: questId }] = await knex('quests')
    .insert({
      rewardType: null,
      rewardId: null,
      eligibilityRequirements: [],
      successRequirements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning('id');

  const [{ id }] = await knex('combined_course_blueprints')
    .insert({
      name,
      internalName: name,
      description: null,
      illustration: null,
      createdAt: someDate,
      updatedAt: someDate,
      surveyUrl: null,
      questId,
    })
    .returning('id');

  return id;
}

export async function createTargetProfileTubesInDB(targetProfileId: number, level: number, tubeIds: string[]) {
  const dataToInsert = tubeIds.map((tubeId) => ({
    targetProfileId,
    tubeId,
    level,
  }));
  await knex('target-profile_tubes').insert(dataToInsert);
}

export async function createGARUser(id: string, firstName: string, lastName: string, cgu: boolean) {
  const someDate = new Date();
  const [{ id: userId }] = await knex('users')
    .insert({
      firstName,
      lastName,
      cgu,
      pixCertifTermsOfServiceAccepted: false,
      lang: 'fr',
      lastTermsOfServiceValidatedAt: cgu ? someDate : null,
      lastPixCertifTermsOfServiceValidatedAt: null,
      mustValidateTermsOfService: false,
      hasSeenAssessmentInstructions: false,
      createdAt: someDate,
      updatedAt: someDate,
      emailConfirmedAt: null,
    })
    .returning('id');

  await knex('authentication-methods').insert({
    userId: userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({
      firstName,
      lastName,
    }),
    externalIdentifier: `externalGAR-${id}`,
    createdAt: someDate,
    updatedAt: someDate,
  });

  return userId;
}
