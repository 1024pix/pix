import sinon from 'sinon';

import { findOrganizationIdsByClientApplication } from '../../../../../src/maddo/domain/usecases/find-organization-ids-by-client-application.js';

describe('Unit | Maddo | Domain | Usecase | Find organization ids by client application', function () {
  context('when client application’s jurisdiction has only one tags rule', function () {
    it('returns the list of organisation ids of given client application jurisdiction', async function () {
      // given
      const expectedOrganizationIds = ['orga1', 'orga2'];
      const clientId = Symbol('clientId');
      const tagNames = Symbol('tagNames');
      const jurisdiction = {
        rules: [{ name: 'tags', value: tagNames }],
      };

      const clientApplicationRepository = {
        getJurisdiction: sinon.stub(),
      };
      clientApplicationRepository.getJurisdiction.withArgs(clientId).resolves(jurisdiction);

      const organizationRepository = {
        findIdsByTagNames: sinon.stub(),
      };
      organizationRepository.findIdsByTagNames.withArgs(tagNames).resolves(expectedOrganizationIds);

      // when
      const organizationIds = await findOrganizationIdsByClientApplication({
        clientId,
        clientApplicationRepository,
        organizationRepository,
      });

      // then
      expect(organizationIds).to.deep.equal(expectedOrganizationIds);
      expect(organizationRepository.findIdsByTagNames).to.have.been.calledOnce;
    });
  });

  context('when client application’s jurisdiction has several tags rules', function () {
    it('returns the list of organisation ids of given client application jurisdiction', async function () {
      // given
      const organizationIdsForTagNames1 = ['orga1', 'orga2'];
      const organizationIdsForTagNames2 = ['orga1', 'orga3'];
      const clientId = Symbol('clientId');
      const tagNames1 = Symbol('tagNames1');
      const tagNames2 = Symbol('tagNames2');
      const jurisdiction = {
        rules: [
          { name: 'tags', value: tagNames1 },
          { name: 'tags', value: tagNames2 },
        ],
      };

      const clientApplicationRepository = {
        getJurisdiction: sinon.stub(),
      };
      clientApplicationRepository.getJurisdiction.withArgs(clientId).resolves(jurisdiction);

      const organizationRepository = {
        findIdsByTagNames: sinon.stub(),
      };
      organizationRepository.findIdsByTagNames.withArgs(tagNames1).resolves(organizationIdsForTagNames1);
      organizationRepository.findIdsByTagNames.withArgs(tagNames2).resolves(organizationIdsForTagNames2);

      // when
      const organizationIds = await findOrganizationIdsByClientApplication({
        clientId,
        clientApplicationRepository,
        organizationRepository,
      });

      // then
      expect(organizationIds).to.deep.equal(['orga1', 'orga2', 'orga3']);
      expect(organizationRepository.findIdsByTagNames).to.have.been.calledTwice;
    });
  });

  context('when client application’s jurisdiction has unknown rules', function () {
    it('discards unknown rules', async function () {
      // given
      const organizationIdsForTagNames1 = ['orga1', 'orga2'];
      const clientId = Symbol('clientId');
      const tagNames1 = Symbol('tagNames1');
      const jurisdiction = {
        rules: [
          { name: 'tags', value: tagNames1 },
          { name: 'organizationIds', value: ['orga1', 'orga3'] },
        ],
      };

      const clientApplicationRepository = {
        getJurisdiction: sinon.stub(),
      };
      clientApplicationRepository.getJurisdiction.withArgs(clientId).resolves(jurisdiction);

      const organizationRepository = {
        findIdsByTagNames: sinon.stub(),
      };
      organizationRepository.findIdsByTagNames.withArgs(tagNames1).resolves(organizationIdsForTagNames1);

      // when
      const organizationIds = await findOrganizationIdsByClientApplication({
        clientId,
        clientApplicationRepository,
        organizationRepository,
      });

      // then
      expect(organizationIds).to.deep.equal(organizationIdsForTagNames1);
      expect(organizationRepository.findIdsByTagNames).to.have.been.calledOnce;
    });
  });
});
