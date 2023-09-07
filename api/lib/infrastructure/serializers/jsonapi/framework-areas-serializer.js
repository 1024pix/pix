import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (framework, { withoutThematics = false } = {}) {
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
          attributes: ['name', 'practicalTitle', 'practicalDescription', 'mobile', 'tablet', 'level'],
        },
      },
    },

    transform(area) {
      if (withoutThematics) {
        return area;
      }
      area.competences.forEach((competence) => {
        competence.thematics = framework.thematics
          .filter((thematic) => {
            return competence.thematicIds.includes(thematic.id);
          })
          .map((thematic) => {
            return {
              ...thematic,
              tubes: framework.tubes
                .filter(({ id }) => {
                  return thematic.tubeIds.includes(id);
                })
                .map((tube) => ({ ...tube, mobile: tube.isMobileCompliant, tablet: tube.isTabletCompliant, level: 8 })),
            };
          })
          .filter((thematic) => {
            return thematic.tubes.length > 0;
          });
      });
      return area;
    },
  }).serialize(framework.areas);
};

export { serialize };
