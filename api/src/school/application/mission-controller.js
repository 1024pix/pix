import * as missionSerializer from '../infrastructure/serializers/mission-serializer.js';
import { usecases } from '../domain/usecases/index.js';

const getById = async function (request, h, dependencies = { missionSerializer }) {
  const { id: missionId } = request.params;
  const mission = await usecases.getMission({ missionId });
  return dependencies.missionSerializer.serialize(mission);
};

const findAll = async function (request, h, dependencies = { missionSerializer }) {
  const missions = await usecases.findAllMissions();
  return dependencies.missionSerializer.serialize(missions);
};

const missionController = { getById, findAll };
export { missionController };
