import { UnableToAttachChildOrganizationToParentOrganizationError } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | attach-child-organization-to-organization', function () {
  describe('success case', function () {
    it('attaches children organizations to parent organization', async function () {
      // given
      const {
        network,
        structure: parentStructure,
        organization: parentOrganization,
      } = databaseBuilder.factory.buildNetworkAndHeadOrganization({ headOrganization: { id: 123 } });

      const { organization: firstChildOrganization, structure: firstChildStructure } =
        databaseBuilder.factory.buildOrganizationWithStructure({ id: 456 });

      const { organization: secondChildOrganization, structure: secondChildStructure } =
        databaseBuilder.factory.buildOrganizationWithStructure({ id: 789 });

      await databaseBuilder.commit();

      const childOrganizationIds = `${firstChildOrganization.id},${secondChildOrganization.id}`;

      // when
      await usecases.attachChildOrganizationToOrganization({
        parentOrganizationId: parentOrganization.id,
        childOrganizationIds,
      });

      // then
      const childrenOrganizationFactStructures = await knex('fct_structures').whereIn('organization_id', [
        firstChildOrganization.id,
        secondChildOrganization.id,
      ]);
      expect(childrenOrganizationFactStructures).to.have.deep.members([
        {
          organization_id: firstChildOrganization.id,
          structure_id: firstChildStructure.id,
          network_id: network.id,
          parent_structure_id: parentStructure.id,
          child_structure_id: null,
        },
        {
          organization_id: secondChildOrganization.id,
          structure_id: secondChildStructure.id,
          parent_structure_id: parentStructure.id,
          network_id: network.id,
          child_structure_id: null,
        },
      ]);
    });

    it('attaches children organizations to parent organization even if parent is already a child', async function () {
      const { network, structure: headStructure } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
        headOrganization: { id: 123, name: 'Head Organization of network' },
      });

      const { organization: level1ChildOrganization, structure: level1ChildStructure } =
        databaseBuilder.factory.buildOrganizationInNetwork({
          networkId: network.id,
          parentStructureId: headStructure.id,
          organizationData: { id: 456, name: 'Level 1 Child' },
        });

      const { organization: level2ChildOrganization, structure: level2ChildStructure } =
        databaseBuilder.factory.buildOrganizationWithStructure({
          id: 789,
          name: 'Level 2 Child',
        });

      await databaseBuilder.commit();

      const childOrganizationIds = `${level2ChildOrganization.id}`;

      // when
      await usecases.attachChildOrganizationToOrganization({
        parentOrganizationId: level1ChildOrganization.id,
        childOrganizationIds,
      });

      // then
      const childrenOrganizationFactStructures = await knex('fct_structures').whereIn('organization_id', [
        level1ChildOrganization.id,
        level2ChildOrganization.id,
      ]);
      expect(childrenOrganizationFactStructures).to.have.deep.members([
        {
          organization_id: level1ChildOrganization.id,
          structure_id: level1ChildStructure.id,
          network_id: network.id,
          parent_structure_id: headStructure.id,
          child_structure_id: null,
        },
        {
          organization_id: level2ChildOrganization.id,
          structure_id: level2ChildStructure.id,
          parent_structure_id: level1ChildStructure.id,
          network_id: network.id,
          child_structure_id: null,
        },
      ]);
    });
  });

  describe('error cases', function () {
    context('when parent organization does not exist', function () {
      it('throws an error', async function () {
        // given
        const unknownParentOrganizationId = 123;

        // when
        const error = await catchErr(usecases.attachChildOrganizationToOrganization)({
          parentOrganizationId: unknownParentOrganizationId,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when parent organization is not part of a network', function () {
      it('throws an error', async function () {
        // given
        const { organization: parentOrganization } = await databaseBuilder.factory.buildOrganizationWithStructure();
        await databaseBuilder.commit();

        // when
        const error = await catchErr(usecases.attachChildOrganizationToOrganization)({
          parentOrganizationId: parentOrganization.id,
        });

        // then
        expect(error).to.deepEqualInstance(
          new UnableToAttachChildOrganizationToParentOrganizationError({
            code: 'UNABLE_TO_ATTACH_TO_ORGANIZATION_NOT_IN_NETWORK',
            message: 'Unable to attach organization to an organization that does not belong to a network',
            meta: {
              parentOrganizationId: parentOrganization.id,
            },
          }),
        );
      });
    });

    context('when at least one of children organization ids is not a number', function () {
      it('throws an UnableToAttachChildOrganizationToParentOrganizationError', async function () {
        // given
        const { organization: parentOrganization } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
          headOrganization: { id: 123 },
        });
        await databaseBuilder.commit();

        const childOrganizationIds = 'abc,456';

        // when
        const error = await catchErr(usecases.attachChildOrganizationToOrganization)({
          parentOrganizationId: parentOrganization.id,
          childOrganizationIds,
        });

        // then
        expect(error).to.deepEqualInstance(
          new UnableToAttachChildOrganizationToParentOrganizationError({
            code: 'INVALID_CHILD_ORGANIZATION_IDS',
            message: 'Child organization IDs must be numbers',
          }),
        );
      });
    });

    context('when at least one of children organization ids is equal to parent organization id', function () {
      it('throws an error', async function () {
        // given
        const { organization: parentOrganization } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
          headOrganization: { id: 123 },
        });

        await databaseBuilder.commit();

        const childOrganizationIds = `${parentOrganization.id},456`;

        // when
        const error = await catchErr(usecases.attachChildOrganizationToOrganization)({
          parentOrganizationId: parentOrganization.id,
          childOrganizationIds,
        });

        // then
        expect(error).to.deepEqualInstance(
          new UnableToAttachChildOrganizationToParentOrganizationError({
            code: 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ITSELF',
            message: 'Unable to attach child organization to itself',
            meta: {
              childOrganizationId: parentOrganization.id,
              parentOrganizationId: parentOrganization.id,
            },
          }),
        );
      });
    });

    context('when at least one of children organization is already part of a network', function () {
      it('throws an error', async function () {
        // given
        const { organization: parentOrganization } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
          network: { name: 'First Network' },
          headOrganization: { id: 123 },
        });

        const otherNetwork = databaseBuilder.factory.buildNetwork({ name: 'Other Network' });
        const { organization: childOrganization } = databaseBuilder.factory.buildOrganizationInNetwork({
          networkId: otherNetwork.id,
          oorganizationData: { id: 456 },
        });

        await databaseBuilder.commit();

        const childOrganizationIds = `${childOrganization.id}`;

        // when
        const error = await catchErr(usecases.attachChildOrganizationToOrganization)({
          parentOrganizationId: parentOrganization.id,
          childOrganizationIds,
        });

        // then
        expect(error).to.deepEqualInstance(
          new UnableToAttachChildOrganizationToParentOrganizationError({
            code: 'UNABLE_TO_ATTACH_ALREADY_ATTACHED_CHILD_ORGANIZATION',
            message: 'Unable to attach organization already belonging to a network',
            meta: {
              childOrganizationId: childOrganization.id,
            },
          }),
        );
      });
    });
  });
});
