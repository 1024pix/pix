import CompetenceTree from '../../../../lib/domain/models/CompetenceTree';
import buildArea from './build-area';
import buildCompetence from './build-competence';

export default function buildCompetenceTree({
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
}
