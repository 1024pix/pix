import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (tutorialSteps) {
  return new Serializer('campaign-tutorial-step', {
    attributes: ['customLandingPageText', 'badges', 'competences'],
    badges: {
      included: true,
      ref: 'id',
      attributes: ['altMessage', 'imageUrl', 'isAlwaysVisible', 'isCertifiable', 'key', 'message', 'title'],
    },
    competences: {
      include: true,
      ref: 'id',
      attributes: ['index', 'name'],
    },
  }).serialize(tutorialSteps);
};

export { serialize };
