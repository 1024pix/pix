import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class BadgeCriterionSerializer extends JSONAPISerializer {
  attrs = {
    skillSets: {
      serialize: true,
    },
    badge: {
      serialize: false,
    },
  };
}
