import { usecases } from '../domain/usecases/index.js';

export async function getMenDashboardCertificationDataset(
  request,
  h,
  dependencies = {
    findCertificationDataset: usecases.findCertificationDataset,
  },
) {
  const { page } = request.query;
  const { models, meta } = await dependencies.findCertificationDataset({
    page,
  });
  return h
    .response({
      dataset: models,
      page: { number: meta.page, size: meta.pageSize, count: meta.pageCount },
    })
    .code(200);
}
