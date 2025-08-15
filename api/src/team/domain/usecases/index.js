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

const usecases = {
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

export { usecases };
