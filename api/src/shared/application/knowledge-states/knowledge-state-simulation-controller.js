import { sharedUsecases } from '../../domain/usecases/index.js';
import { knowledgeStateSimulationSerializer } from '../../infrastructure/serializers/jsonapi/knowledge-state-simulation-serializer.js';

const simulate = async (request, h, dependencies = { knowledgeStateSimulationSerializer }) => {
  const { knowledgeElements } = request.payload.data;

  const simulation = await sharedUsecases.simulateKnowledgeStateMigration({ knowledgeElements });

  return h.response(dependencies.knowledgeStateSimulationSerializer.serialize(simulation)).code(200);
};

export const knowledgeStateSimulationController = { simulate };
