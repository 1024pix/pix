import { env } from 'node:process';

import { API_DATA_QUERIES, apiData } from '../../shared/infrastructure/datasources/ApiData.js';

const getCoverRate = async () => {
  const [byAreas, byCompetences, byTubes] = await Promise.all([
    await apiData.get(API_DATA_QUERIES.coverageRateByAreas, [{ name: 'tag_names', value: [env['API_DATA_TAG']] }]),
    await apiData.get(API_DATA_QUERIES.coverageRateByCompetences, [{ name: 'tag_names', value: [env['API_DATA_TAG']] }]),
    await apiData.get(API_DATA_QUERIES.coverageByTubes, [{ name: 'tag_names', value: [env['API_DATA_TAG']] }]),
  ]);

  return {
    data: {
      id: '1',
      attributes: {
        'by-areas': byAreas.data,
        'by-competences': byCompetences.data,
        'by-tubes': byTubes.data,
      },
      type: 'cover-rates',
    },
  };
};

const controller = {
  getCoverRate,
};
export { controller };
