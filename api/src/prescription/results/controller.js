import { env } from 'node:process';

import { API_DATA_QUERIES, apiData } from '../../shared/infrastructure/datasources/ApiData.js';

const getCoverRate = async () => {

  const tag = env.API_DATA_TAG;
  const orga = Number(env.API_DATA_ORGA);

  const [forNetByAreas, forNetByCompetences, forNetByTubes] = await Promise.all([
    await apiData.get(API_DATA_QUERIES.coverageRateByAreas, [{ name: 'tag_names', value: [tag] }]),
    await apiData.get(API_DATA_QUERIES.coverageRateByCompetences, [
      { name: 'tag_names', value: [tag] },
    ]),
    await apiData.get(API_DATA_QUERIES.coverageByTubes, [{ name: 'tag_names', value: [tag] }]),
  ]);

  const [forOrgByAreas, forOrgByCompetences, forOrgByTubes] = await Promise.all([
    await apiData.get(API_DATA_QUERIES.coverageRateByAreas, [
      { name: 'tag_names', value: [tag] },
      { name: 'organization_ids', value: [orga] },
    ]),
    await apiData.get(API_DATA_QUERIES.coverageRateByCompetences, [
      { name: 'tag_names', value: [tag] },
      { name: 'organization_ids', value: [orga] },
    ]),
    await apiData.get(API_DATA_QUERIES.coverageByTubes, [
      { name: 'tag_names', value: [tag] },
      { name: 'organization_ids', value: [orga] },
    ]),
  ]);

  return {
    data: {
      id: '1',
      attributes: {
        'for-network': {
          byAreas: forNetByAreas.data,
          byCompetences: forNetByCompetences.data,
          byTubes: forNetByTubes.data,
        },
        'for-organization': {
          byAreas: forOrgByAreas.data,
          byCompetences: forOrgByCompetences.data,
          byTubes: forOrgByTubes.data,
        },
      },
      type: 'cover-rates',
    },
  };
};

const controller = {
  getCoverRate,
};
export { controller };
