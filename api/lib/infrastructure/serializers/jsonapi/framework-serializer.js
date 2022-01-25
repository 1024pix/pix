const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(framework) {
    framework.thematics.forEach((thematic) => {
      thematic.tubes = framework.tubes.filter(({ id }) => {
        return thematic.tubeIds.includes(id);
      });
    });
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
            attributes: ['practicalTitle', 'practicalDescription', 'mobile', 'tablet'],
          },
        },
      },

      transform(area) {
        area.competences.forEach((competence) => {
          competence.thematics = framework.thematics.filter((thematic) => {
            return competence.thematicIds.includes(thematic.id) && thematic.tubes.length > 0;
          });
        });
        return area;
      },
    }).serialize(framework.areas);
  },
};
