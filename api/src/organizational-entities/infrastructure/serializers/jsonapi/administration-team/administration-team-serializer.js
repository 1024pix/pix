import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (administrationTeam) {
  return new Serializer('administration-teams', {
    attributes: ['name'],
  }).serialize(administrationTeam);
};

export const administrationTeamSerializer = { serialize };
