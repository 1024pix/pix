import { usecases } from '../../domain/usecases/index.js';
import * as missionSerializer from '../../infrastructure/serializers/jsonapi/mission-serializer.js';

const getById = async function (request, h, dependencies = { missionSerializer }) {
  const { id: missionId } = request.params;
  const mission = await usecases.getMission({ missionId });
  return dependencies.missionSerializer.serialize(mission);
};

const missionController = { getById };
export { missionController };
