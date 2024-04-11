import { usecases } from '../domain/usecases/index.js';
import * as missionSerializer from '../infrastructure/serializers/mission-serializer.js';

const getById = async function (request, h, dependencies = { missionSerializer }) {
  const { id: organizationId, missionId } = request.params;
  const mission = await usecases.getMission({ missionId, organizationId });
  return dependencies.missionSerializer.serialize(mission);
};

const findAllActive = async function (request, h, dependencies = { missionSerializer }) {
  const { id: organizationId } = request.params;
  const missions = await usecases.findAllActiveMissions({ organizationId });
  return dependencies.missionSerializer.serialize(missions);
};

const missionController = { getById, findAllActive };
export { missionController };
