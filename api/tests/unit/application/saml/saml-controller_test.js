const { sinon, expect, hFake } = require('../../../test-helper');
const samlController = require('../../../../lib/application/saml/saml-controller');
const usecases = require('../../../../lib/domain/usecases');
const saml = require('../../../../lib/infrastructure/saml');
const tokenService = require('../../../../lib/domain/services/token-service');
const { features } = require('../../../../lib/config');

describe('Unit | Application | Controller | Saml', () => {

  describe('#assert', () => {

    context('When garAccessV2 is disabled', () => {

      beforeEach(() => {
        features.garAccessV2 = false;
        sinon.stub(tokenService, 'createAccessTokenFromUser').returns('dummy-token');
      });

      it('should call use case to get or create account for user', async () => {
        // given
        const userAttributes = {
          'urn:oid:0.9.2342.19200300.100.1.3': 'adele@example.net',
          'urn:oid:2.5.4.4': 'Lopez',
          'urn:oid:2.5.4.42': 'Adèle',
        };

        sinon.stub(saml, 'parsePostResponse')
          .withArgs('fake-request-payload')
          .resolves(userAttributes);

        sinon.stub(usecases, 'getOrCreateSamlUser').resolves({
          id: 12,
        });

        // when
        const response = await samlController.assert({ payload: 'fake-request-payload' }, hFake);

        // then
        expect(usecases.getOrCreateSamlUser).to.have.been.calledWith({ userAttributes });
        expect(response.location).to.match(/^\/\?token=dummy-token&user-id=12$/);
      });
    });
  });

  context('When garAccessV2 is enabled', () => {

    beforeEach(() => {
      features.garAccessV2 = true;
    });

    it('should generate token for student reconciliation', async () => {
      // given
      const userAttributes = {
        'urn:oid:0.9.2342.19200300.100.1.3': 'adele@example.net',
        'urn:oid:2.5.4.4': 'Lopez',
        'urn:oid:2.5.4.42': 'Adèle',
      };

      sinon.stub(saml, 'parsePostResponse')
        .withArgs('fake-request-payload')
        .resolves(userAttributes);

      sinon.stub(tokenService, 'createTokenForStudentReconciliation').returns('dummy-student-reconciliation-token');

      // when
      const response = await samlController.assert({ payload: 'fake-request-payload' }, hFake);

      // then
      expect(tokenService.createTokenForStudentReconciliation).to.have.been.calledWith({ userAttributes });
      expect(response.location).to.equal('/campagnes?externalUser=dummy-student-reconciliation-token');
    });
  });
});
