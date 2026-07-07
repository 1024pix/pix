import * as mailService from '../../../../src/shared/domain/services/mail-service.js';
import * as sharedMembershipRepository from '../../../../src/shared/infrastructure/repositories/membership-repository.js';
import * as organizationRepository from '../../../../src/shared/infrastructure/repositories/organization-repository.js';
import * as certificationCenterRepository from '../../../certification/shared/infrastructure/repositories/certification-center-repository.js';
import { refreshTokenRepository } from '../../../identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import * as userRepository from '../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as certificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';
import { certificationCenterInvitedUserRepository } from '../../infrastructure/repositories/certification-center-invited-user.repository.js';
import { certificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as membershipRepository from '../../infrastructure/repositories/membership.repository.js';
import { organizationInvitationRepository } from '../../infrastructure/repositories/organization-invitation.repository.js';
import { organizationInvitedUserRepository } from '../../infrastructure/repositories/organization-invited-user.repository.js';
import * as organizationMemberIdentityRepository from '../../infrastructure/repositories/organization-member-identity.repository.js';
import { userOrgaSettingsRepository } from '../../infrastructure/repositories/user-orga-settings-repository.js';
import { userOrganizationsForAdminRepository } from '../../infrastructure/repositories/user-organizations-for-admin.repository.js';
import * as certificationCenterInvitationService from '../services/certification-center-invitation-service.js';
import { organizationInvitationService } from '../services/organization-invitation.service.js';

const dependencies = {
  adminMemberRepository,
  certificationCenterMembershipRepository,
  certificationCenterInvitedUserRepository,
  certificationCenterRepository,
  certificationCenterInvitationRepository,
  prescriberRepository: repositories.prescriberRepository,
  membershipRepository,
  userOrgaSettingsRepository,
  certificationCenterInvitationService,
  mailService,
  organizationInvitationService,
  organizationInvitationRepository,
  organizationInvitedUserRepository,
  organizationMemberIdentityRepository,
  organizationRepository,
  refreshTokenRepository,
  sharedMembershipRepository,
  userOrganizationsForAdminRepository,
  userRepository,
};

import { adminMemberRepository } from '../../infrastructure/repositories/admin-member.repository.js';
import { acceptCertificationCenterInvitation } from './accept-certification-center-invitation.usecase.js';
import { acceptOrganizationInvitation } from './accept-organization-invitation.usecase.js';
import { archiveCertificationCenterData } from './archive-certification-center-data.usecase.js';
import { cancelCertificationCenterInvitation } from './cancel-certification-center-invitation.js';
import { cancelOrganizationInvitation } from './cancel-organization-invitation.js';
import { createCertificationCenterMembershipByEmail } from './create-certification-center-membership-by-email.usecase.js';
import { createCertificationCenterMembershipForScoOrganizationAdminMember } from './create-certification-center-membership-for-sco-organization-admin-member.usecase.js';
import { createMembership } from './create-membership.usecase.js';
import { createOrUpdateCertificationCenterInvitation } from './create-or-update-certification-center-invitation.js';
import { createOrUpdateCertificationCenterInvitationForAdmin } from './create-or-update-certification-center-invitation-for-admin.js';
import { createOrUpdateUserOrgaSettings } from './create-or-update-user-orga-settings.usecase.js';
import { createOrganizationInvitationByAdmin } from './create-organization-invitation-by-admin.usecase.js';
import { createOrganizationInvitations } from './create-organization-invitations.usecase.js';
import { createProOrganizationInvitation } from './create-pro-organization-invitation.usecase.js';
import { deactivateAdminMember } from './deactivate-admin-member.usecase.js';
import { disableCertificationCenterMembershipFromPixAdmin } from './disable-certification-center-membership-from-pix-admin.usecase.js';
import { disableCertificationCenterMembershipFromPixCertif } from './disable-certification-center-membership-from-pix-certif.js';
import { disableMembership } from './disable-membership.usecase.js';
import { disableOwnOrganizationMembership } from './disable-own-organization-membership.usecase.js';
import { findCertificationCenterMembershipsByCertificationCenter } from './find-certification-center-memberships-by-certification-center.usecase.js';
import { findCertificationCenterMembershipsByUser } from './find-certification-center-memberships-by-user.js';
import { findPaginatedFilteredOrganizationMemberships } from './find-paginated-filtered-organization-memberships.js';
import { findPendingCertificationCenterInvitations } from './find-pending-certification-center-invitations.usecase.js';
import { findPendingOrganizationInvitations } from './find-pending-organization-invitations.js';
import { findUserOrganizationsForAdmin } from './find-user-organizations-for-admin.usecase.js';
import { getAdminMemberDetails } from './get-admin-member-details.usecase.js';
import { getAdminMembers } from './get-admin-members.usecase.js';
import { getCertificationCenterInvitation } from './get-certification-center-invitation.usecase.js';
import { getOrganizationInvitation } from './get-organization-invitation.js';
import { getOrganizationMemberIdentities } from './get-organization-member-identities.usecase.js';
import { getOrganizationMembership } from './get-organization-membership.js';
import { getPrescriber } from './get-prescriber.js';
import { getUserTeamsInfo } from './get-user-teams-info.usecase.js';
import { resendCertificationCenterInvitation } from './resend-certification-center-invitation.usecase.js';
import { resendOrganizationInvitation } from './resend-organization-invitation.usecase.js';
import { saveAdminMember } from './save-admin-member.usecase.js';
import { sendScoInvitation } from './send-sco-invitation.js';
import { updateAdminMember } from './update-admin-member.usecase.js';
import { updateCertificationCenterMembership } from './update-certification-center-membership.usecase.js';
import { updateCertificationCenterMembershipLastAccessedAt } from './update-certification-center-membership-last-accessed-at.usecase.js';
import { updateCertificationCenterReferer } from './update-certification-center-referer.js';
import { updateMembership } from './update-membership.usecase.js';
import { updateMembershipLastAccessedAt } from './update-membership-last-accessed-at.usecase.js';

const usecasesWithoutInjectedDependencies = {
  acceptCertificationCenterInvitation,
  acceptOrganizationInvitation,
  archiveCertificationCenterData,
  cancelCertificationCenterInvitation,
  cancelOrganizationInvitation,
  createCertificationCenterMembershipByEmail,
  createCertificationCenterMembershipForScoOrganizationAdminMember,
  createMembership,
  createOrUpdateCertificationCenterInvitationForAdmin,
  createOrUpdateCertificationCenterInvitation,
  createOrUpdateUserOrgaSettings,
  createOrganizationInvitationByAdmin,
  createOrganizationInvitations,
  createProOrganizationInvitation,
  deactivateAdminMember,
  disableCertificationCenterMembershipFromPixAdmin,
  disableCertificationCenterMembershipFromPixCertif,
  disableMembership,
  disableOwnOrganizationMembership,
  findCertificationCenterMembershipsByCertificationCenter,
  findCertificationCenterMembershipsByUser,
  findPaginatedFilteredOrganizationMemberships,
  findPendingCertificationCenterInvitations,
  findPendingOrganizationInvitations,
  findUserOrganizationsForAdmin,
  getAdminMemberDetails,
  getAdminMembers,
  getCertificationCenterInvitation,
  getOrganizationInvitation,
  getOrganizationMemberIdentities,
  getOrganizationMembership,
  getPrescriber,
  getUserTeamsInfo,
  resendCertificationCenterInvitation,
  resendOrganizationInvitation,
  saveAdminMember,
  sendScoInvitation,
  updateAdminMember,
  updateCertificationCenterMembershipLastAccessedAt,
  updateCertificationCenterMembership,
  updateCertificationCenterReferer,
  updateMembershipLastAccessedAt,
  updateMembership,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
