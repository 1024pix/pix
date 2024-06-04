import { requestResponseUtils } from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { certificationCenterInvitationSerializer } from '../../../src/team/infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

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
  resendCertificationCenterInvitation,
};

export { certificationCenterInvitationController };
