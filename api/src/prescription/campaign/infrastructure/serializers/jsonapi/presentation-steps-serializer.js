import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (presentationSteps) {
  return new Serializer('campaign-presentation-step', {
    attributes: ['customLandingPageText', 'badges', 'competences'],
    badges: {
      ref: 'id',
      attributes: ['altMessage', 'imageUrl', 'isAlwaysVisible', 'isCertifiable', 'key', 'message', 'title'],
    },
    competences: {
      ref: 'id',
      attributes: ['index', 'name'],
    },
  }).serialize(presentationSteps);
};

export { serialize };
