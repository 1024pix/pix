const CompetenceTree = require('../../../../lib/domain/models/CompetenceTree');

const buildArea = require('./build-area');
const buildCompetence = require('./build-competence');

module.exports = function buildCompetenceTree({
  id = 1,
  areas = [
    buildArea({
      id: 'recvoGdo7z2z7pXWa',
      code: '1',
      title: 'Information et données',
      name: '1. Information et données',
      color: 'jaffa',
      competences: [
        buildCompetence({
          name: 'Mener une recherche et une veille d’information',
          id: 'recsvLz0W2ShyfD63',
          index: '1.1',
        }),
        buildCompetence({
          name: 'Mener une recherche et une veille d’information',
          id: 'recNv8qhaY887jQb2',
          index: '1.2',
        }),
        buildCompetence({
          name: 'Mener une recherche et une veille d’information',
          id: 'recIkYm646lrGvLNT',
          index: '1.3',
        }),
      ],
    }),
  ],
} = {}) {

  return new CompetenceTree({
    id,
    areas,
  });
};
