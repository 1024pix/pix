import { requestResponseUtils } from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { certificationCenterInvitationSerializer } from '../../../src/team/infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

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
  resendCertificationCenterInvitation,
};

export { certificationCenterInvitationController };
