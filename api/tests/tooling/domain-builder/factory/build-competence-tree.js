import { CompetenceTree } from '../../../../lib/domain/models/CompetenceTree.js';
import { buildArea } from './build-area.js';
import { buildCompetence } from './build-competence.js';

const buildCompetenceTree = function ({
  id = 1,
  areas = [
    buildArea({
      id: 'recvoGdo7z2z7pXWa',
      code: '1',
      title: 'Information et données',
      name: '1. Information et données',
      color: 'jaffa',
      frameworkId: 'recAi12kj43h23jrh3',
      framework: {
        id: 'recAi12kj43h23jrh3',
        name: 'PIX',
      },
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

export { buildCompetenceTree };
