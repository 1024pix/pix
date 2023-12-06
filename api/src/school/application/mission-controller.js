import * as missionSerializer from '../infrastructure/serializers/mission-serializer.js';
import { usecases } from '../shared/usecases/index.js';

const getById = async function (request, h, dependencies = { missionSerializer }) {
  const { id: missionId } = request.params;
  const mission = await usecases.getMission({ missionId });
  return dependencies.missionSerializer.serialize(mission);
};

const missionController = { getById };
export { missionController };
