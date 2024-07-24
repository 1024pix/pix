import { usecases } from '../../../src/team/domain/usecases/index.js';

const acceptOrganizationInvitation = async function (request) {
  const organizationInvitationId = request.params.id;
  const { code, email: rawEmail } = request.payload.data.attributes;
  const localeFromCookie = request.state?.locale;
  const email = rawEmail?.trim().toLowerCase();

  const membership = await usecases.acceptOrganizationInvitation({
    organizationInvitationId,
    code,
    email,
    localeFromCookie,
  });
  await usecases.createCertificationCenterMembershipForScoOrganizationAdminMember({ membership });
  return null;
};

const organizationInvitationController = { acceptOrganizationInvitation };
export { organizationInvitationController };
