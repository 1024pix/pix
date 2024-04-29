import dayjs from 'dayjs';

import { escapeFileName } from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as learningContentPDFPresenter from './presenter/pdf/learning-content-pdf-presenter.js';

const getContentAsJsonFile = async function (request, h) {
  const targetProfileId = request.params.id;

  const { jsonContent, targetProfileName } = await usecases.getTargetProfileContentAsJson({ targetProfileId });

  const filename = escapeFileName(`${dayjs().format('YYYYMMDD')}_profil_cible_${targetProfileName}`);

  return h
    .response(jsonContent)
    .header('Content-Type', 'application/json;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${filename}.json`);
};

const attachOrganizationsFromExistingTargetProfile = async function (request, h) {
  const existingTargetProfileId = request.payload['target-profile-id'];
  const targetProfileId = request.params.id;
  await usecases.attachOrganizationsFromExistingTargetProfile({ targetProfileId, existingTargetProfileId });
  return h.response({}).code(204);
};

const getLearningContentAsPdf = async function (request, h, dependencies = { learningContentPDFPresenter }) {
  const targetProfileId = request.params.id;
  const { language } = request.query;

  const { learningContent, targetProfileName } = await usecases.getLearningContentByTargetProfile({
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

const targetProfileController = {
  attachOrganizationsFromExistingTargetProfile,
  getContentAsJsonFile,
  getLearningContentAsPdf,
};

export { targetProfileController };
