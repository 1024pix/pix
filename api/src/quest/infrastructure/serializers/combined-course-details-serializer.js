import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (combinedCourse) {
  return new Serializer('combined-courses', {
    attributes: ['name', 'code', 'campaignIds'],
  }).serialize(combinedCourse);
};

export { serialize };
