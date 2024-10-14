import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (areas, { withoutThematics = false } = {}) {
  return new Serializer('area', {
    ref: 'id',
    attributes: ['code', 'title', 'color', 'competences'],

    competences: {
      include: true,
      ref: 'id',
      attributes: ['name', 'index', 'thematics'],

      thematics: {
        include: true,
        ref: 'id',
        attributes: ['name', 'index', 'tubes'],

        tubes: {
          include: true,
          ref: 'id',
          attributes: ['name', 'practicalTitle', 'practicalDescription', 'mobile', 'tablet', 'level', 'skills'],
          skills: {
            include: true,
            ref: 'id',
            attributes: ['difficulty'],
          },
        },
      },
    },

    transform(area) {
      if (withoutThematics) {
        return area.toDTOWithoutThematics();
      }
      return area;
    },
  }).serialize(areas);
};

export { serialize };
