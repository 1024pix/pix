const { expect, sinon } = require('../../../test-helper');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');
const certificationPartnerAcquisitionRepository = require('../../../../lib/infrastructure/repositories/certification-partner-acquisition-repository');
const { handleCertificationAcquisitionForPartner } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-certification-partner', () => {
  const domainTransaction = Symbol('domainTransaction');
  const reproducibilityRate = Symbol('reproducibilityRate');

  let event;

  const dependencies = {
    certificationPartnerAcquisitionRepository,
  };

  it('fails when event is not of correct type', async () => {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handleCertificationAcquisitionForPartner)(
      { event, ...dependencies, domainTransaction }
    );

    // then
    expect(error).not.to.be.null;
  });

  context('#handleCertificationAcquisitionForPartner', () => {
    const certificationCourseId = Symbol('certificationCourseId');
    const userId = Symbol('userId');
    const cleaPartnerAcquisition = {};

    beforeEach(() => {
      event = new CertificationScoringCompleted({
        certificationCourseId,
        userId,
        isCertification: true,
        reproducibilityRate,
        limitDate: new Date('2018-02-03'),
      });

      sinon.stub(certificationPartnerAcquisitionRepository, 'save').resolves();

      sinon.stub(certificationPartnerAcquisitionRepository, 'buildCertificationCleaAcquisition').withArgs({
        certificationCourseId,
        userId,
        reproducibilityRate,
        domainTransaction
      }).resolves(cleaPartnerAcquisition);

    });

    context('when certification is eligible', () => {
      it('it should save a certif partner', async () => {
        // given
        cleaPartnerAcquisition.isEligible = () => true;

        // when
        await handleCertificationAcquisitionForPartner({
          event, ...dependencies, domainTransaction
        });

        // then
        expect(certificationPartnerAcquisitionRepository.save).to.have.been.calledWithMatch(cleaPartnerAcquisition, domainTransaction);
      });
    });
    context('when certification is not eligible', () => {
      it('it should not save a certif partner', async () => {
        // given
        cleaPartnerAcquisition.isEligible = () => false;

        // when
        await handleCertificationAcquisitionForPartner({
          event, ...dependencies, domainTransaction
        });

        // then
        expect(certificationPartnerAcquisitionRepository.save).not.to.have.been.called;
      });
    });

  });
});
