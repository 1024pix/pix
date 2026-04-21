import * as organizationLearnerTypeRepository from '../../../../../src/organizational-entities/infrastructure/repositories/organization-learner-type-repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Repository | organization-learner-type-repository', function () {
  describe('#findAll', function () {
    it('should return all organization learner types ordered by name', async function () {
      // given
      const firstOrganizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        name: 'Type B',
        createdAt: new Date('2020-01-01'),
      });
      const secondOrganizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        name: 'Type A',
        createdAt: new Date('2021-01-02'),
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerTypeRepository.findAll();

      // then
      expect(result).to.have.deep.members([
        domainBuilder.acquisition.buildOrganizationLearnerType({
          id: secondOrganizationLearnerType.id,
          name: secondOrganizationLearnerType.name,
        }),
        domainBuilder.acquisition.buildOrganizationLearnerType({
          id: firstOrganizationLearnerType.id,
          name: firstOrganizationLearnerType.name,
        }),
      ]);
    });

    it('should return an empty array if there is no organization learner type', async function () {
      // when
      const result = await organizationLearnerTypeRepository.findAll();

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#getById', function () {
    it('should return the organization learner type with the given id', async function () {
      // given
      const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        id: 123,
      });

      databaseBuilder.factory.buildOrganizationLearnerType({
        id: 456,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerTypeRepository.getById(organizationLearnerType.id);

      // then
      expect(result).to.deep.equal(
        domainBuilder.acquisition.buildOrganizationLearnerType({
          id: organizationLearnerType.id,
          name: organizationLearnerType.name,
        }),
      );
    });

    it('should throw if there is no organization learner type with the given name', async function () {
      // given
      const unknownId = 123;

      // when
      const error = await catchErr(organizationLearnerTypeRepository.getById)(unknownId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#findExistingIds', function () {
    it('should return the ids of the organization learner types matching the given ids', async function () {
      // given
      const firstOrganizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        id: 123,
      });
      const secondOrganizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
        id: 456,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerTypeRepository.findExistingIds({
        ids: [firstOrganizationLearnerType.id, secondOrganizationLearnerType.id],
      });

      // then
      expect(result).to.deep.equal([firstOrganizationLearnerType.id, secondOrganizationLearnerType.id]);
    });

    it('should return an empty array if no organization learner type matches the given ids', async function () {
      // given
      const unknownIds = [123, 456];

      // when
      const result = await organizationLearnerTypeRepository.findExistingIds({ ids: unknownIds });

      // then
      expect(result).to.deep.equal([]);
    });
  });
});
