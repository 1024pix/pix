import {
  NetworkAlreadyExistError,
  OrganizationNotFound,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | create-network', function () {
  describe('when the organization does not belong to a network', function () {
    it('returns the newly created network', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const network = await usecases.createNetwork({
        organizationId,
        networkName: 'Random Network Name',
      });

      // then
      const createdNetwork = await knex('networks').first();
      const expectedNetwork = domainBuilder.acquisition.buildNetwork(createdNetwork);
      expect(network).to.deep.equal(expectedNetwork);
    });
  });

  describe('when the organization already belongs to a network', function () {
    it('throws an error', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const network = databaseBuilder.factory.buildNetwork();
      const structureId = databaseBuilder.factory.buildStructure().id;
      databaseBuilder.factory.buildFactStructure({
        structureId,
        networkId: network.id,
        organizationId,
      });

      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.createNetwork)({
        organizationId,
        networkName: 'Random Network Name',
      });

      // then
      expect(error).to.deepEqualInstance(new NetworkAlreadyExistError());
    });
  });

  describe('when the organization does not exist', function () {
    it('throw an error', async function () {
      // given
      const unknownOrganizationId = 123;

      // when
      const error = await catchErr(usecases.createNetwork)({
        organizationId: unknownOrganizationId,
        networkName: 'Random Network Name',
      });

      // then
      expect(error).to.deepEqualInstance(
        new OrganizationNotFound({
          meta: {
            organizationId: Number(unknownOrganizationId),
          },
        }),
      );
    });
  });
});
