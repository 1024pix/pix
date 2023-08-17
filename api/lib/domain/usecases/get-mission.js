import _ from 'lodash';

import { NotFoundError } from '../errors.js';

const getMission = async function ({ missionId, missionRepository }) {
  const mission = await missionRepository.get(missionId);
  if (_.isEmpty(mission)) {
    throw new NotFoundError(`Il n'existe pas de mission ayant pour id ${missionId}`);
  }
  return mission;
};

export { getMission };
