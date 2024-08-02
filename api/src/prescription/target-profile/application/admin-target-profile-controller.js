import dayjs from 'dayjs';

import { usecases } from '../../../../lib/domain/usecases/index.js';
import * as organizationSerializer from '../../../organizational-entities/infrastructure/serializers/jsonapi/organization-serializer.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { escapeFileName } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases as prescriptionTargetProfileUsecases } from '../domain/usecases/index.js';
import * as targetProfileAttachOrganizationSerializer from '../infrastructure/serializers/jsonapi/target-profile-attach-organization-serializer.js';
import * as targetProfileDetachOrganizationsSerializer from '../infrastructure/serializers/jsonapi/target-profile-detach-organizations-serializer.js';
import * as targetProfileSerializer from '../infrastructure/serializers/jsonapi/target-profile-serializer.js';
import * as learningContentPDFPresenter from './presenter/pdf/learning-content-pdf-presenter.js';

const getContentAsJsonFile = async function (request, h) {
  const targetProfileId = request.params.id;

  const { jsonContent, targetProfileName } = await prescriptionTargetProfileUsecases.getTargetProfileContentAsJson({
    targetProfileId,
  });

  const filename = escapeFileName(`${dayjs().format('YYYYMMDD')}_profil_cible_${targetProfileName}`);

  return h
    .response(jsonContent)
    .header('Content-Type', 'application/json;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${filename}.json`);
};

const attachOrganizations = async function (request, h, dependencies = { targetProfileAttachOrganizationSerializer }) {
  const organizationIds = request.payload['organization-ids'];
  const targetProfileId = request.params.id;
  const results = await prescriptionTargetProfileUsecases.attachOrganizationsToTargetProfile({
    targetProfileId,
    organizationIds,
  });

  return h
    .response(dependencies.targetProfileAttachOrganizationSerializer.serialize({ ...results, targetProfileId }))
    .code(200);
};

const attachOrganizationsFromExistingTargetProfile = async function (request, h) {
  const existingTargetProfileId = request.payload['target-profile-id'];
  const targetProfileId = request.params.id;
  await prescriptionTargetProfileUsecases.attachOrganizationsFromExistingTargetProfile({
    targetProfileId,
    existingTargetProfileId,
  });
  return h.response({}).code(204);
};

const getLearningContentAsPdf = async function (request, h, dependencies = { learningContentPDFPresenter }) {
  const targetProfileId = request.params.id;
  const { language } = request.query;

  const { learningContent, targetProfileName } =
    await prescriptionTargetProfileUsecases.getLearningContentByTargetProfile({
      targetProfileId,
      language,
    });

  const filename = escapeFileName(`${dayjs().format('YYYYMMDD')}_profil_cible_${targetProfileName}`);

  const pdfBuffer = await dependencies.learningContentPDFPresenter.present(
    learningContent,
    targetProfileName,
    language,
  );

  return h
    .response(pdfBuffer)
    .header('Content-Disposition', `attachment; filename=${filename}.pdf`)
    .header('Content-Type', 'application/pdf');
};

const attachTargetProfiles = async function (request, h) {
  const targetProfileIds = request.payload['target-profile-ids'];
  const organizationId = request.params.organizationId;
  await prescriptionTargetProfileUsecases.attachTargetProfilesToOrganization({ organizationId, targetProfileIds });

  return h.response({}).code(204);
};

const detachOrganizations = async function (request, h, dependencies = { targetProfileDetachOrganizationsSerializer }) {
  const { organizationIds } = request.deserializedPayload;
  const targetProfileId = request.params.targetProfileId;

  const detachedOrganizationIds = await prescriptionTargetProfileUsecases.detachOrganizationsFromTargetProfile({
    targetProfileId,
    organizationIds,
  });

  return h
    .response(
      dependencies.targetProfileDetachOrganizationsSerializer.serialize({ detachedOrganizationIds, targetProfileId }),
    )
    .code(200);
};

const outdateTargetProfile = async function (request, h) {
  const id = request.params.targetProfileId;

  await prescriptionTargetProfileUsecases.outdateTargetProfile({ id });
  return h.response({}).code(204);
};

const markTargetProfileAsSimplifiedAccess = async function (request, h) {
  const id = request.params.targetProfileId;

  const targetProfile = await prescriptionTargetProfileUsecases.markTargetProfileAsSimplifiedAccess({ id });
  return h.response(targetProfileSerializer.serialize(targetProfile));
};

const findPaginatedFilteredTargetProfileOrganizations = async function (request) {
  const targetProfileId = request.params.targetProfileId;
  const { filter, page } = request.query;

  const { models: organizations, pagination } =
    await prescriptionTargetProfileUsecases.findPaginatedFilteredOrganizationByTargetProfileId({
      targetProfileId,
      filter,
      page,
    });
  return organizationSerializer.serialize(organizations, pagination);
};

const copyTargetProfile = withTransaction(async (request) => {
  const targetProfileIdToCopy = request.params.targetProfileId;
  const copiedTargetProfileId = await prescriptionTargetProfileUsecases.copyTargetProfile({
    targetProfileId: targetProfileIdToCopy,
  });
  await Promise.all([
    await usecases.copyTargetProfileBadges({
      originTargetProfileId: targetProfileIdToCopy,
      destinationTargetProfileId: copiedTargetProfileId,
    }),
    await usecases.copyTargetProfileStages({
      originTargetProfileId: targetProfileIdToCopy,
      destinationTargetProfileId: copiedTargetProfileId,
    }),
  ]);

  return copiedTargetProfileId;
});

const targetProfileController = {
  outdateTargetProfile,
  markTargetProfileAsSimplifiedAccess,
  attachTargetProfiles,
  attachOrganizations,
  detachOrganizations,
  attachOrganizationsFromExistingTargetProfile,
  getContentAsJsonFile,
  getLearningContentAsPdf,
  findPaginatedFilteredTargetProfileOrganizations,
  copyTargetProfile,
};

export { targetProfileController };
