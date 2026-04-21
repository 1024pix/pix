import { StructureNotFoundError } from '../../../../../src/organizational-entities/domain/errors.js';
import * as networkRepository from '../../../../../src/organizational-entities/infrastructure/repositories/network.repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Infrastructure | Repositories | network', function () {
  describe('#findAll', function () {
    describe('when there are networks', function () {
      it('returns the networks ordered by name', async function () {
        // given
        const secondNetwork = databaseBuilder.factory.buildNetwork({ name: 'B Réseau' });
        const firstNetwork = databaseBuilder.factory.buildNetwork({ name: 'A Réseau' });

        await databaseBuilder.commit();

        // when
        const foundNetworks = await networkRepository.findAll();

        // then
        const expectedFirstNetwork = domainBuilder.acquisition.buildNetwork({
          id: firstNetwork.id,
          name: firstNetwork.name,
        });

        const expectedSecondNetwork = domainBuilder.acquisition.buildNetwork({
          id: secondNetwork.id,
          name: secondNetwork.name,
        });

        expect(foundNetworks).to.have.lengthOf(2);
        expect(foundNetworks[0]).to.deepEqualInstance(expectedFirstNetwork);
        expect(foundNetworks[1]).to.deepEqualInstance(expectedSecondNetwork);
      });
    });

    describe('when there are no networks', function () {
      it('returns an empty array', async function () {
        // when
        const foundNetworks = await networkRepository.findAll();

        // then
        expect(foundNetworks).to.be.empty;
      });
    });

    describe('when a filter name is provided', function () {
      it('returns matching networks ordered by name', async function () {
        // given
        const matchingNetwork1 = databaseBuilder.factory.buildNetwork({ name: 'Réseau Bretagne' });
        const matchingNetwork2 = databaseBuilder.factory.buildNetwork({ name: 'Réseau Alsace' });
        databaseBuilder.factory.buildNetwork({ name: 'Autre' });
        await databaseBuilder.commit();

        // when
        const foundNetworks = await networkRepository.findAll({ filter: { name: 'Réseau' } });

        // then
        expect(foundNetworks).to.have.lengthOf(2);
        expect(foundNetworks[0]).to.deepEqualInstance(
          domainBuilder.acquisition.buildNetwork({ id: matchingNetwork2.id, name: matchingNetwork2.name }),
        );
        expect(foundNetworks[1]).to.deepEqualInstance(
          domainBuilder.acquisition.buildNetwork({ id: matchingNetwork1.id, name: matchingNetwork1.name }),
        );
      });

      it('filters case-insensitively', async function () {
        // given
        const network = databaseBuilder.factory.buildNetwork({ name: 'Réseau National' });
        await databaseBuilder.commit();

        // when
        const foundNetworks = await networkRepository.findAll({ filter: { name: 'réseau national' } });

        // then
        expect(foundNetworks).to.have.lengthOf(1);
        expect(foundNetworks[0]).to.deepEqualInstance(
          domainBuilder.acquisition.buildNetwork({ id: network.id, name: network.name }),
        );
      });

      it('returns an empty array when no network matches', async function () {
        // given
        databaseBuilder.factory.buildNetwork({ name: 'Réseau Bretagne' });
        await databaseBuilder.commit();

        // when
        const foundNetworks = await networkRepository.findAll({ filter: { name: 'Introuvable' } });

        // then
        expect(foundNetworks).to.be.empty;
      });
    });
  });

  describe('#getById', function () {
    describe('when the network is found', function () {
      it('returns the network with head organization informations', async function () {
        // given
        const headOrganizationId = 999;
        const { network } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
          name: 'Mon super réseau',
          headOrganization: { id: headOrganizationId, name: 'Orga tête de réseau' },
        });

        await databaseBuilder.commit();

        // when
        const foundNetwork = await networkRepository.getById(network.id);

        // then
        const expectedNetwork = domainBuilder.acquisition.buildNetwork({
          id: network.id,
          name: 'Mon super réseau',
          organizationId: headOrganizationId,
          organizationName: 'Orga tête de réseau',
        });

        expect(foundNetwork).to.deepEqualInstance(expectedNetwork);
      });

      context('when there are several organizations in the network', function () {
        it('returns the network with correct head organization informations', async function () {
          // given
          const { network, head } = databaseBuilder.factory.buildNetworkWithMultipleLevels({
            name: 'My network',
            numberOfLevels: 2,
          });

          await databaseBuilder.commit();

          // when
          const foundNetwork = await networkRepository.getById(network.id);

          // then
          const expectedNetwork = domainBuilder.acquisition.buildNetwork({
            id: network.id,
            name: 'My network',
            organizationId: head.organization.id,
            organizationName: head.organization.name,
          });

          expect(foundNetwork).to.deepEqualInstance(expectedNetwork);
        });
      });
    });

    describe('when the network is not found', function () {
      it('throws a not found error', async function () {
        // given
        databaseBuilder.factory.buildNetworkAndHeadOrganization({ id: 1, name: 'Réseau avec id 1' });

        await databaseBuilder.commit();

        const nonExistingNetworkId = 2;

        // when
        const error = await catchErr(networkRepository.getById)(nonExistingNetworkId);

        // then

        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#findByOrganizationId', function () {
    describe('when an organization belongs to a network', function () {
      it('returns the network', async function () {
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

        const expectedNetwork = domainBuilder.acquisition.buildNetwork(network);

        // when
        const foundNetwork = await networkRepository.findByOrganizationId(organizationId);

        // then
        expect(foundNetwork).to.deepEqualInstance(expectedNetwork);
      });
    });

    describe('when an organization does not belong to a network', function () {
      it('returns null', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        await databaseBuilder.commit();

        // when
        const result = await networkRepository.findByOrganizationId(organizationId);

        // then
        expect(result).to.be.null;
      });
    });
  });

  describe('#update', function () {
    describe('when the network exists', function () {
      it('updates and returns the network with the new name', async function () {
        // given
        const persistedNetwork = databaseBuilder.factory.buildNetwork({ name: 'Ancien nom' });
        await databaseBuilder.commit();
        const network = domainBuilder.acquisition.buildNetwork({ id: persistedNetwork.id, name: 'Nouveau nom' });

        // when
        const updatedNetwork = await networkRepository.update(network);

        // then
        const foundNetwork = await knex('networks').select('id', 'name').where({ id: persistedNetwork.id }).first();
        expect(foundNetwork.name).to.equal('Nouveau nom');
        expect(updatedNetwork).to.deep.equal(
          domainBuilder.acquisition.buildNetwork({ id: persistedNetwork.id, name: 'Nouveau nom' }),
        );
      });
    });

    describe('when the network does not exist', function () {
      it('throws a NotFoundError', async function () {
        // given
        const network = domainBuilder.acquisition.buildNetwork({ id: 99999, name: 'Nom' });

        // when
        const error = await catchErr(networkRepository.update)(network);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#save', function () {
    it('saves and returns the new network', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const structure = databaseBuilder.factory.buildStructure();
      databaseBuilder.factory.buildFactStructure({
        structureId: structure.id,
        networkId: null,
        organizationId: organizationId,
      });
      const networkName = 'Network 1';
      await databaseBuilder.commit();

      // when
      const savedNetwork = await networkRepository.save({ organizationId, networkName });

      // then
      const foundNetwork = await knex('networks').select('id', 'name').where({ name: networkName }).first();
      expect(foundNetwork).to.deep.equal({
        id: foundNetwork.id,
        name: networkName,
      });
      const updatedFactStructure = await knex('fct_structures')
        .where('fct_structures.organization_id', organizationId)
        .first();
      expect(updatedFactStructure.network_id).to.equal(foundNetwork.id);
      const expectedNetwork = domainBuilder.acquisition.buildNetwork(foundNetwork);
      expect(savedNetwork).to.deep.equal(expectedNetwork);
    });
  });

  describe('#attachOrganization', function () {
    it('attaches an organization to the network through its parent', async function () {
      // given
      const {
        network,
        organization: parentOrganization,
        structure: parentStructure,
      } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
        headOrganization: { id: 123, name: 'Head Organization of network' },
      });

      const { organization: childOrganization, structure: childStructure } =
        databaseBuilder.factory.buildOrganizationWithStructure({ id: 456 });

      await databaseBuilder.commit();

      // when
      await networkRepository.attachOrganization({
        childOrganizationId: childOrganization.id,
        parentOrganizationId: parentOrganization.id,
      });

      // then
      const updatedFactStructure = await knex('fct_structures')
        .where({ organization_id: childOrganization.id })
        .first();
      expect(updatedFactStructure).to.deep.equal({
        organization_id: childOrganization.id,
        structure_id: childStructure.id,
        network_id: network.id,
        parent_structure_id: parentStructure.id,
        child_structure_id: null,
      });
    });

    context('error handling', function () {
      it('throws when parent organization does not have a structure', async function () {
        const parentOrganization = databaseBuilder.factory.buildOrganization({ name: 'Parent organization' });

        const { organization: childOrganization } = databaseBuilder.factory.buildOrganizationWithStructure({
          name: 'Child Organization',
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(networkRepository.attachOrganization)({
          childOrganizationId: childOrganization.id,
          parentOrganizationId: parentOrganization.id,
        });

        // then
        expect(error).to.be.instanceOf(StructureNotFoundError);
        expect(error.meta).to.deep.equal({ organizationId: parentOrganization.id });
      });

      it('throws when child organization does not have a structure', async function () {
        const { organization: parentOrganization } = databaseBuilder.factory.buildNetworkAndHeadOrganization({
          name: 'My network',
          headOrganization: { name: 'Parent organization' },
        });

        const childOrganization = databaseBuilder.factory.buildOrganization({
          name: 'Child Organization without structure',
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(networkRepository.attachOrganization)({
          childOrganizationId: childOrganization.id,
          parentOrganizationId: parentOrganization.id,
        });

        // then
        expect(error).to.be.instanceOf(StructureNotFoundError);
        expect(error.meta).to.deep.equal({ organizationId: childOrganization.id });
      });
    });
  });
});
