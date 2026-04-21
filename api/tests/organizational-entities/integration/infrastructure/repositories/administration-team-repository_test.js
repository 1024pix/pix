import * as administrationTeamRepository from '../../../../../src/organizational-entities/infrastructure/repositories/administration-team-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Repository | administration-team-repository', function () {
  describe('#findAll', function () {
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
      const result = await administrationTeamRepository.findAll();

      // then
      expect(result).to.have.deep.members([
        domainBuilder.buildAdministrationTeam({ id: secondAdministrationTeam.id, name: 'Équipe A' }),
        domainBuilder.buildAdministrationTeam({ id: firstAdministrationTeam.id, name: 'Équipe B' }),
      ]);
    });

    it('should return an empty array if there is no pix team', async function () {
      // when
      const result = await administrationTeamRepository.findAll();

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#getById', function () {
    it('should return the administration team when it exists', async function () {
      // given
      const administrationTeam = databaseBuilder.factory.buildAdministrationTeam();
      await databaseBuilder.commit();

      // when
      const result = await administrationTeamRepository.getById(administrationTeam.id);

      // then
      expect(result).to.deep.equal(
        domainBuilder.buildAdministrationTeam({
          id: administrationTeam.id,
          name: administrationTeam.name,
        }),
      );
    });

    it('should return null when the administration team does not exist', async function () {
      // when
      const result = await administrationTeamRepository.getById(456);

      // then
      expect(result).to.be.null;
    });
  });

  describe('#findExistingIds', function () {
    it('should return the administration team ids matching the given ids', async function () {
      // given
      const administrationTeam1 = databaseBuilder.factory.buildAdministrationTeam();
      const administrationTeam2 = databaseBuilder.factory.buildAdministrationTeam();
      await databaseBuilder.commit();

      // when
      const foundAdministrationTeamIds = await administrationTeamRepository.findExistingIds({
        ids: [administrationTeam1.id, administrationTeam2.id],
      });

      // then
      expect(foundAdministrationTeamIds).to.deep.equal([administrationTeam1.id, administrationTeam2.id]);
    });

    it('should return an empty array if there is no matching id', async function () {
      // given
      const unknownIds = [456, 789];

      // when
      const foundAdministrationTeamIds = await administrationTeamRepository.findExistingIds({
        ids: unknownIds,
      });

      // then
      expect(foundAdministrationTeamIds).to.deep.equal([]);
    });
  });
});
