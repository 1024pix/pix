const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const {
  OrganizationNotFoundError,
  OrganizationWithoutEmailError,
  ManyOrganizationsFoundError,
} = require('../../../../lib/domain/errors');

describe('Unit | UseCase | send-sco-invitation', function () {
  let organizationRepository;

  beforeEach(function () {
    organizationRepository = {
      findScoOrganizationByUai: sinon.stub(),
    };
  });

  context('when UAI did not match', function () {
    it('should throw an NotFoundOrganizationError', async function () {
      // given
      const uai = '1234567A';
      domainBuilder.buildOrganization({ type: 'SCO', externalId: uai });

      organizationRepository.findScoOrganizationByUai.withArgs(uai).resolves([]);

      const requestErr = await catchErr(usecases.sendScoInvitation)({
        uai,
        organizationRepository,
      });

      expect(requestErr).to.be.instanceOf(OrganizationNotFoundError);
      expect(requestErr.message).to.be.equal("L'UAI/RNE 1234567A de l'établissement n’est pas reconnu.");
    });
  });

  context('when email is not present', function () {
    it('should throw an OrganizationWithoutEmailError', async function () {
      // given
      const uai = '1234567A';
      const organization = domainBuilder.buildOrganization({ type: 'SCO', externalId: uai, email: null });

      organizationRepository.findScoOrganizationByUai.withArgs(uai).resolves([organization]);

      const requestErr = await catchErr(usecases.sendScoInvitation)({
        uai,
        organizationRepository,
      });

      expect(requestErr).to.be.instanceOf(OrganizationWithoutEmailError);
      expect(requestErr.message).to.be.equal(
        "Nous n’avons pas d’adresse e-mail de contact associée à l'établissement concernant l'UAI/RNE 1234567A."
      );
    });
  });

  context('when many organizations found', function () {
    it('should throw a ManyOrganizationsFoundError', async function () {
      // given
      const uai = '1234567A';
      const organization1 = domainBuilder.buildOrganization({ type: 'SCO', externalId: uai });
      const organization2 = domainBuilder.buildOrganization({ type: 'SCO', externalId: uai });

      organizationRepository.findScoOrganizationByUai.withArgs(uai).resolves([organization1, organization2]);

      // when
      const requestErr = await catchErr(usecases.sendScoInvitation)({
        uai,
        organizationRepository,
      });

      // then
      expect(requestErr).to.be.instanceOf(ManyOrganizationsFoundError);
      expect(requestErr.message).to.be.equal(
        "Plusieurs établissements de type SCO ont été retrouvés pour L'UAI/RNE 1234567A."
      );
    });
  });
});
