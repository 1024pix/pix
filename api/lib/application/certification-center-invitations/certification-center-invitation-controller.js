import { usecases } from '../../domain/usecases/index.js';
import { certificationCenterInvitationSerializer } from '../../infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';
import { requestResponseUtils } from '../../infrastructure/utils/request-response-utils.js';

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

const getCertificationCenterInvitation = async function (request) {
  const certificationCenterInvitationId = request.params.id;
  const certificationCenterInvitationCode = request.query.code;

  const certificationCenterInvitation = await usecases.getCertificationCenterInvitation({
    certificationCenterInvitationId,
    certificationCenterInvitationCode,
  });
  return certificationCenterInvitationSerializer.serialize(certificationCenterInvitation);
};

const cancelCertificationCenterInvitation = async function (request, h) {
  const certificationCenterInvitationId = request.params.certificationCenterInvitationId;
  await usecases.cancelCertificationCenterInvitation({ certificationCenterInvitationId });
  return h.response().code(204);
};

const resendCertificationCenterInvitation = async function (request, h) {
  const certificationCenterInvitationId = request.params.certificationCenterInvitationId;
  const locale = requestResponseUtils.extractLocaleFromRequest(request);

  const certificationCenterInvitation = await usecases.resendCertificationCenterInvitation({
    certificationCenterInvitationId,
    locale,
  });

  return h.response(certificationCenterInvitationSerializer.serializeForAdmin(certificationCenterInvitation)).code(200);
};

const certificationCenterInvitationController = {
  acceptCertificationCenterInvitation,
  getCertificationCenterInvitation,
  cancelCertificationCenterInvitation,
  resendCertificationCenterInvitation,
};

export { certificationCenterInvitationController };
