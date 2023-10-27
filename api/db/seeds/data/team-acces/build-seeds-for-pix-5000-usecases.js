import { createOrganization } from '../common/tooling/organization-tooling.js';
import { createCertificationCenter } from '../common/tooling/certification-center-tooling.js';
import { REAL_PIX_SUPER_ADMIN_ID } from '../common/common-builder.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../../lib/domain/models/CertificationCenterMembership.js';

export async function buildSeedsForPix5000UseCases(databaseBuilder) {
  await _buildUseCase1(databaseBuilder);
  await _buildUseCase2(databaseBuilder);
  await _buildUseCase3(databaseBuilder);
  await _buildUseCase4(databaseBuilder);
  await _buildUseCase5(databaseBuilder);
}

async function _buildUseCase1(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Aoi',
    lastName: 'Todo',
    email: 'aoi.todo@example.net',
    username: 'aoi.todo',
  });

  const externalId = 'PIX5000UC1';
  const name = 'PIX5000 UC1';
  const type = 'SCO';

  await createOrganization({
    databaseBuilder,
    name,
    type,
    isManagingStudents: true,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    externalId,
  });
  await createCertificationCenter({ databaseBuilder, name, type, externalId });
}

async function _buildUseCase2(databaseBuilder) {
  const organizationMemberId = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Yūji',
    lastName: 'Itadori',
    email: 'yuji.itadori@example.net',
    username: 'yuji.itadori',
  }).id;

  const externalId = 'PIX5000UC2';
  const name = 'PIX5000 UC2';
  const type = 'SCO';

  await createOrganization({
    databaseBuilder,
    name,
    type,
    isManagingStudents: true,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    externalId,
    memberIds: [organizationMemberId],
  });
  await createCertificationCenter({ databaseBuilder, name, type, externalId });
}

async function _buildUseCase3(databaseBuilder) {
  const organizationAdminId = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Satoru',
    lastName: 'Gojō',
    email: 'satoru.gojo@example.net',
    username: 'satoru.gojo',
  }).id;
  const organizationMemberId = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Megumi',
    lastName: 'Fushiguro',
    email: 'megumi.fushiguro@example.net',
    username: 'megumi.fushiguro',
  }).id;

  const externalId = 'PIX5000UC3';
  const name = 'PIX5000 UC3';
  const type = 'SCO';

  await createOrganization({
    databaseBuilder,
    name,
    type,
    isManagingStudents: true,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    externalId,
    adminIds: [organizationAdminId],
    memberIds: [organizationMemberId],
  });
  await createCertificationCenter({ databaseBuilder, name, type, externalId });
}

async function _buildUseCase4(databaseBuilder) {
  const organizationMemberAndCertificationCenterMemberId = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Kasumi',
    lastName: 'Miwa',
    email: 'kasumi.miwa@example.net',
    username: 'kasumi.miwa',
  }).id;
  const certificationCenterMembers = [
    { id: organizationMemberAndCertificationCenterMemberId, role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER },
  ];

  const externalId = 'PIX5000UC4';
  const name = 'PIX5000 UC4';
  const type = 'SCO';

  await createOrganization({
    databaseBuilder,
    name,
    type,
    isManagingStudents: true,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    externalId,
    memberIds: [organizationMemberAndCertificationCenterMemberId],
  });
  await createCertificationCenter({ databaseBuilder, name, type, externalId, members: certificationCenterMembers });
}

async function _buildUseCase5(databaseBuilder) {
  const organizationAdminId = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Kento',
    lastName: 'Nanami',
    email: 'kento.nanami@example.net',
    username: 'kento.nanami',
  }).id;
  const organizationMemberAndCertificationCenterMemberId = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Suguru',
    lastName: 'Geto',
    email: 'suguru.geto@example.net',
    username: 'suguru.geto',
  }).id;
  const certificationCenterMemberId = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Maki',
    lastName: 'Zenin',
    email: 'maki.zenin@example.net',
    username: 'maki.zenin',
  }).id;
  const certificationCenterMembers = [
    { id: organizationMemberAndCertificationCenterMemberId, role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER },
    { id: certificationCenterMemberId, role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER },
  ];

  const externalId = 'PIX5000UC5';
  const name = 'PIX5000 UC5';
  const type = 'SCO';

  await createOrganization({
    databaseBuilder,
    name,
    type,
    isManagingStudents: true,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    externalId,
    adminIds: [organizationAdminId],
    memberIds: [organizationMemberAndCertificationCenterMemberId],
  });
  await createCertificationCenter({ databaseBuilder, name, type, externalId, members: certificationCenterMembers });
}
