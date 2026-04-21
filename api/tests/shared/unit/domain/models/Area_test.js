import { Area } from '../../../../../src/shared/domain/models/Area.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Shared | Unit | domain | models | Area ', function () {
  it('sorts given competences by Index', function () {
    const area = new Area({
      id: 'recvoGdo7z2z7pXWa',
      code: '1',
      name: '1. Information et données',
      title: 'Information et données',
      color: 'jaffa',
      frameworkId: 'recAi12kj43h23jrh3',
      competences: [
        domainBuilder.buildCompetence({
          name: 'Mener une recherche et une veille d’information',
          id: 'recsvLz0W2ShyfD63',
          index: '1.1',
        }),
        domainBuilder.buildCompetence({
          name: 'Mener une recherche et une veille d’information',
          id: 'recIkYm646lrGvLNT',
          index: '1.3',
        }),
        domainBuilder.buildCompetence({
          name: 'Mener une recherche et une veille d’information',
          id: 'recNv8qhaY887jQb2',
          index: '1.2',
        }),
      ],
    });

    const expectedSortedAreaCompetences = [
      domainBuilder.buildCompetence({
        name: 'Mener une recherche et une veille d’information',
        id: 'recsvLz0W2ShyfD63',
        index: '1.1',
      }),
      domainBuilder.buildCompetence({
        name: 'Mener une recherche et une veille d’information',
        id: 'recNv8qhaY887jQb2',
        index: '1.2',
      }),
      domainBuilder.buildCompetence({
        name: 'Mener une recherche et une veille d’information',
        id: 'recIkYm646lrGvLNT',
        index: '1.3',
      }),
    ];

    expect(area.competences).to.deep.equal(expectedSortedAreaCompetences);
  });
});
