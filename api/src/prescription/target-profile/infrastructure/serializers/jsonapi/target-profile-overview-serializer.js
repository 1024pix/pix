import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (targetProfiles) {
  return new Serializer('target-profile-overview', {
    ref: 'id',
    attributes: ['name', 'isSimplifiedAccess', 'description', 'imageUrl', 'category', 'level', 'badges', 'frameworks'],
    badges: {
      ref: 'id',
      included: true,
      attributes: ['altMessage', 'imageUrl', 'message', 'title', 'key', 'isCertifiable', 'isAlwaysVisible', 'criteria'],
    },
    frameworks: {
      ref: 'id',
      included: true,
      attributes: ['name', 'areas'],

      areas: {
        include: true,
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
              attributes: [
                'name',
                'practicalTitle',
                'practicalDescription',
                'isMobileCompliant',
                'isTabletCompliant',
                'maxLevel',
              ],
            },
          },
        },
      },
    },
  }).serialize(targetProfiles);
};

export { serialize };
