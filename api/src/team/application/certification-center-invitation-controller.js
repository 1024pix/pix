import { extractLocaleFromRequest } from '../../../lib/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';

const sendInvitations = async function (request, h) {
  const certificationCenterId = request.params.certificationCenterId;
  const emails = request.payload.data.attributes.emails;
  const locale = extractLocaleFromRequest(request);

  await usecases.createOrUpdateCertificationCenterInvitation({ certificationCenterId, emails, locale });

  return h.response().code(204);
};

const certificationCenterInvitationController = { sendInvitations };

export { certificationCenterInvitationController };
