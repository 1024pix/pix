import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (courseItems) {
  return new Serializer('courses', {
    attributes: ['name', 'type', 'nbTubes', 'nbModules', 'category', 'isSimplifiedAccess', 'areas'],
    areas: {
      ref: 'id',
      attributes: ['title', 'code', 'color', 'competences'],
      competences: {
        ref: 'id',
        attributes: ['name', 'index'],
      },
    },
  }).serialize(courseItems);
};

export const courseSerializer = { serialize };
