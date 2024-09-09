import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { certificationCenterInvitationSerializer } from '../../infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';

/**
 * @callback acceptCertificationCenterInvitatio
 * @param request
 * @param h
 * @returns {Promise<void>}
 */
const acceptCertificationCenterInvitation = async function (request, h) {
  const certificationCenterInvitationId = request.params.id;
  const { code, email: rawEmail } = request.deserializedPayload;
  const localeFromCookie = request.state?.locale;
  const email = rawEmail.trim().toLowerCase();

  await usecases.acceptCertificationCenterInvitation({
    certificationCenterInvitationId,
    code,
    email,
    localeFromCookie,
  });
  return h.response({}).code(204);
};

/**
 * @callback sendInvitations
 * @param request
 * @param h
 * @returns {Promise<void>}
 */
const sendInvitations = async function (request, h) {
  const certificationCenterId = request.params.certificationCenterId;
  const emails = request.payload.data.attributes.emails;
  const locale = extractLocaleFromRequest(request);

  await usecases.createOrUpdateCertificationCenterInvitation({ certificationCenterId, emails, locale });

  return h.response().code(204);
};

const cancelCertificationCenterInvitation = async function (request, h) {
  const certificationCenterInvitationId = request.params.certificationCenterInvitationId;
  await usecases.cancelCertificationCenterInvitation({ certificationCenterInvitationId });
  return h.response().code(204);
};

const findPendingInvitations = async function (request, h) {
  const certificationCenterId = request.params.certificationCenterId;

  const certificationCenterInvitations = await usecases.findPendingCertificationCenterInvitations({
    certificationCenterId,
  });
  return h.response(certificationCenterInvitationSerializer.serializeForAdmin(certificationCenterInvitations));
};

export const certificationCenterInvitationController = {
  acceptCertificationCenterInvitation,
  cancelCertificationCenterInvitation,
  findPendingInvitations,
  sendInvitations,
};
