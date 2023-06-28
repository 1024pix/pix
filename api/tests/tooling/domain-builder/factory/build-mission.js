import { Mission } from '../../../../lib/shared/domain/models/Mission.js';

const buildMission = function buildMission({ id = 'recThem1', name = 'My Mission' } = {}) {
  return new Mission({
    id,
    name,
  });
};

export { buildMission };
