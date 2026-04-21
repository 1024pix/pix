import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | UseCases | find-all-administration-teams', function () {
  context('when there are administration teams', function () {
    it('should return all administration teams ordered by name', async function () {
      // given
      const firstAdministrationTeam = databaseBuilder.factory.buildAdministrationTeam({
        name: 'Équipe B',
        createdAt: new Date('2020-01-01'),
      });
      const secondAdministrationTeam = databaseBuilder.factory.buildAdministrationTeam({
        name: 'Équipe A',
        createdAt: new Date('2021-01-02'),
      });
      await databaseBuilder.commit();

      // when
      const result = await usecases.findAllAdministrationTeams();

      // then
      expect(result).to.have.deep.members([
        domainBuilder.buildAdministrationTeam({ id: secondAdministrationTeam.id, name: 'Équipe A' }),
        domainBuilder.buildAdministrationTeam({ id: firstAdministrationTeam.id, name: 'Équipe B' }),
      ]);
    });
  });

  context('when there is no administration team', function () {
    it('should return an empty array', async function () {
      // when
      const result = await usecases.findAllAdministrationTeams();

      // then
      expect(result).to.deep.equal([]);
    });
  });
});
