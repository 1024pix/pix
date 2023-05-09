import { Serializer } from 'jsonapi-serializer';

const serialize = function (badge = {}) {
  return new Serializer('badge', {
    ref: 'id',
    attributes: ['altMessage', 'imageUrl', 'message', 'key', 'title', 'isCertifiable', 'isAlwaysVisible'],
  }).serialize(badge);
};

const deserialize = function (json) {
  return {
    key: json.data.attributes['key'],
    altMessage: json.data.attributes['alt-message'],
    message: json.data.attributes['message'],
    title: json.data.attributes['title'],
    isCertifiable: json.data.attributes['is-certifiable'],
    isAlwaysVisible: json.data.attributes['is-always-visible'],
    imageUrl: json.data.attributes['image-url'],
  };
};

export { serialize, deserialize };
