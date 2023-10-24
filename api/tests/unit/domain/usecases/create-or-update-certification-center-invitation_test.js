import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import * as usecases from '../../../../lib/domain/usecases/create-or-update-certification-center-invitation.js';

describe('Unit | Domain | UseCases | CreateOrUpdateCertificationCenterInvitation', function () {
  context('when creating or updating one certification center invitation', function () {
    it('creates or updates an invitation', async function () {
      // given
      const certificationCenterInvitationRepository = {};
      const certificationCenterId = 1;
      const emails = ['   naruto@e    xample.net   '];
      const locale = 'fr-fr';
      const certificationCenter = domainBuilder.buildCertificationCenter({
        id: 1,
        name: 'Konoha Certification Center',
      });
      const certificationCenterRepository = {
        get: sinon.stub().resolves(certificationCenter),
      };

      const createOrUpdateCertificationCenterInvitationInjectorStub = sinon.stub();
      const createOrUpdateCertificationCenterInvitationStub = sinon.stub();
      const certificationCenterInvitationService = {
        createOrUpdateCertificationCenterInvitation: createOrUpdateCertificationCenterInvitationInjectorStub.returns(
          createOrUpdateCertificationCenterInvitationStub,
        ),
      };

      // when
      await usecases.createOrUpdateCertificationCenterInvitation({
        certificationCenterInvitationService,
        certificationCenterRepository,
        certificationCenterInvitationRepository,
        certificationCenterId,
        emails,
        locale,
      });

      // then
      expect(certificationCenterRepository.get).to.have.been.calledWith(certificationCenterId);
      expect(createOrUpdateCertificationCenterInvitationInjectorStub).to.have.been.calledOnceWithExactly({
        certificationCenterInvitationRepository,
      });
      expect(createOrUpdateCertificationCenterInvitationStub).to.have.been.calledOnceWithExactly({
        certificationCenter,
        email: emails[0].replace(/ /g, ''),
        locale,
      });
    });
  });

  context('when creating or updating multiple certification center invitations', function () {
    it('creates or updates multiple invitations', async function () {
      // given
      const certificationCenterInvitationRepository = {};
      const certificationCenterId = 1;
      const emails = ['naruto@example.net', 'jiraya@example.net'];
      const locale = 'fr-fr';
      const certificationCenter = domainBuilder.buildCertificationCenter({
        id: 1,
        name: 'Konoha Certification Center',
      });
      const certificationCenterRepository = {
        get: sinon.stub().resolves(certificationCenter),
      };

      const createOrUpdateCertificationCenterInvitationInjectorStub = sinon.stub();
      const createOrUpdateCertificationCenterInvitationStub = sinon.stub();
      const certificationCenterInvitationService = {
        createOrUpdateCertificationCenterInvitation: createOrUpdateCertificationCenterInvitationInjectorStub.returns(
          createOrUpdateCertificationCenterInvitationStub,
        ),
      };

      // when
      await usecases.createOrUpdateCertificationCenterInvitation({
        certificationCenterInvitationService,
        certificationCenterRepository,
        certificationCenterInvitationRepository,
        certificationCenterId,
        emails,
        locale,
      });

      // then
      expect(certificationCenterRepository.get).to.have.been.calledWith(certificationCenterId);
      expect(createOrUpdateCertificationCenterInvitationInjectorStub).to.have.been.callCount(2);
      expect(createOrUpdateCertificationCenterInvitationStub).to.have.been.callCount(2);
    });
  });
});
