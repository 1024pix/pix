const { catchErr, expect, sinon } = require('../../../test-helper');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');
const partnerCertificationRepository = require('../../../../lib/infrastructure/repositories/partner-certification-repository');
const { handlePartnerCertifications } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-partner-certification', function() {
  const domainTransaction = Symbol('domainTransaction');
  const reproducibilityRate = Symbol('reproducibilityRate');

  let event;

  const dependencies = {
    partnerCertificationRepository,
  };

  it('fails when event is not of correct type', async function() {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handlePartnerCertifications)(
      { event, ...dependencies, domainTransaction },
    );

    // then
    expect(error).not.to.be.null;
  });

  context('#handlePartnerCertifications', function() {
    const certificationCourseId = Symbol('certificationCourseId');
    const userId = Symbol('userId');
    const cleaCertification = {};

    beforeEach(function() {
      event = new CertificationScoringCompleted({
        certificationCourseId,
        userId,
        isCertification: true,
        reproducibilityRate,
        limitDate: new Date('2018-02-03'),
      });

      sinon.stub(partnerCertificationRepository, 'save').resolves();

      sinon.stub(partnerCertificationRepository, 'buildCleaCertification').withArgs({
        certificationCourseId,
        userId,
        reproducibilityRate,
        domainTransaction,
      }).resolves(cleaCertification);

    });

    context('when certification is eligible', function() {
      it('it should save a certif partner', async function() {
        // given
        cleaCertification.isEligible = () => true;

        // when
        await handlePartnerCertifications({
          event, ...dependencies, domainTransaction,
        });

        // then
        expect(partnerCertificationRepository.save).to.have.been.calledWithMatch({
          partnerCertification: cleaCertification,
          domainTransaction,
        });
      });
    });
    context('when certification is not eligible', function() {
      it('it should not save a certif partner', async function() {
        // given
        cleaCertification.isEligible = () => false;

        // when
        await handlePartnerCertifications({
          event, ...dependencies, domainTransaction,
        });

        // then
        expect(partnerCertificationRepository.save).not.to.have.been.called;
      });
    });

  });
});
