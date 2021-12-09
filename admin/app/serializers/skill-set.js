import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class SkillSetSerializer extends JSONAPISerializer {
  attrs = {
    badge: {
      serialize: false,
    },
  };
}
