import { usecases } from '../../domain/usecases/index.js';
import { administrationTeamSerializer } from '../../infrastructure/serializers/jsonapi/administration-team/administration-team-serializer.js';

const findAllAdministrationTeams = async function (request, h, dependencies = { administrationTeamSerializer }) {
  const administrationTeams = await usecases.findAllAdministrationTeams();
  return dependencies.administrationTeamSerializer.serialize(administrationTeams);
};

const administrationTeamsController = { findAllAdministrationTeams };

export { administrationTeamsController };
