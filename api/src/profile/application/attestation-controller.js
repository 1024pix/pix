import { FRENCH_FRANCE } from '../../shared/domain/services/locale-service.js';
import { usecases } from '../domain/usecases/index.js';
import { attestationDetailSerializer } from '../infrastructure/serializers/jsonapi/attestation-detail-serializer.js';
import { attestationSerializer } from '../infrastructure/serializers/jsonapi/attestation-serializer.js';
import * as pdfWithFormSerializer from '../infrastructure/serializers/pdf/pdf-with-form-serializer.js';

const getUserAttestation = async function (request, h, dependencies = { pdfWithFormSerializer }) {
  const userId = request.params.userId;
  const attestationKey = request.params.attestationKey;

  const locale = FRENCH_FRANCE;
  const { data, template } = await usecases.getAttestationDataForUsers({
    attestationKey,
    userIds: [userId],
    locale,
  });

  const buffer = await dependencies.pdfWithFormSerializer.serializeStream(template, data);

  return h.response(buffer).header('Content-Type', 'application/pdf');
};

const getUserAttestationsDetails = async function (
  request,
  _,
  dependencies = { attestationSerializer: attestationDetailSerializer },
) {
  const userId = request.auth.credentials.userId;

  const profileRewards = await usecases.getProfileRewardsByUserId({ userId });

  return usecases.getAttestationDetails({ profileRewards }).then(dependencies.attestationSerializer.serialize);
};

const getAll = async function (request, _, dependencies = { attestationAdminSerializer: attestationSerializer }) {
  const attestations = await usecases.getAllAttestations();
  return dependencies.attestationAdminSerializer.serialize(attestations);
};

const attestationController = {
  getAll,
  getUserAttestation,
  getUserAttestationsDetails,
};

export { attestationController };
