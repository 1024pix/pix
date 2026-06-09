import { usecases } from '../../domain/usecases/index.js';

const createModuleIssueReport = async function (request, h) {
  const userAgent = request.headers['user-agent'].slice(0, 255);

  const {
    'module-id': moduleId,
    'passage-id': passageId,
    'element-id': elementId,
    answer,
    comment,
    'category-key': categoryKey,
  } = request.payload.data.attributes;

  const moduleIssueReport = { moduleId, passageId, elementId, answer, comment, categoryKey, userAgent };
  const createdModuleIssueReportId = await usecases.createModuleIssueReport({ moduleIssueReport });

  return h
    .response({
      data: {
        id: createdModuleIssueReportId,
        type: 'module-issue-reports',
      },
    })
    .created();
};

export const moduleIssueReportController = { createModuleIssueReport };
