import { usecases as libUsecases } from '../../../lib/domain/usecases/index.js';
import { certificationCenterInvitationSerializer } from '../../../lib/infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';
import { extractLocaleFromRequest } from '../../../lib/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';

const sendInvitations = async function (request, h) {
  const certificationCenterId = request.params.certificationCenterId;
  const emails = request.payload.data.attributes.emails;
  const locale = extractLocaleFromRequest(request);

  await usecases.createOrUpdateCertificationCenterInvitation({ certificationCenterId, emails, locale });

  return h.response().code(204);
};

const sendInvitationForAdmin = async function (request, h, dependencies = { certificationCenterInvitationSerializer }) {
  const certificationCenterId = request.params.certificationCenterId;
  const invitationInformation = await certificationCenterInvitationSerializer.deserializeForAdmin(request.payload);

  const { certificationCenterInvitation, isInvitationCreated } =
    await libUsecases.createOrUpdateCertificationCenterInvitationForAdmin({
      certificationCenterId,
      email: invitationInformation.email,
      locale: invitationInformation.language,
      role: invitationInformation.role,
    });

  const serializedCertificationCenterInvitation =
    dependencies.certificationCenterInvitationSerializer.serializeForAdmin(certificationCenterInvitation);
  if (isInvitationCreated) {
    return h.response(serializedCertificationCenterInvitation).created();
  }
  return h.response(serializedCertificationCenterInvitation);
};

const certificationCenterInvitationController = { sendInvitations, sendInvitationForAdmin };

export { certificationCenterInvitationController };
