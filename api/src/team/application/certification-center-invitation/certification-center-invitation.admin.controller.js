import { usecases } from '../../domain/usecases/index.js';
import { certificationCenterInvitationSerializer } from '../../infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';

const sendInvitationForAdmin = async function (request, h, dependencies = { certificationCenterInvitationSerializer }) {
  const certificationCenterId = request.params.certificationCenterId;
  const invitationInformation = await certificationCenterInvitationSerializer.deserializeForAdmin(request.payload);

  const { certificationCenterInvitation, isInvitationCreated } =
    await usecases.createOrUpdateCertificationCenterInvitationForAdmin({
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

const certificationCenterInvitationAdminController = { sendInvitationForAdmin };

export { certificationCenterInvitationAdminController };
