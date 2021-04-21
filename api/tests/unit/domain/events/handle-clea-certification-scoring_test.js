const _ = require('lodash');
const { catchErr, expect, sinon } = require('../../../test-helper');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');
const { handleCleaCertificationScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-clea-certification-scoring', () => {
  const reproducibilityRate = Symbol('reproducibilityRate');

  let event;
  const partnerCertificationScoringRepository = {
    buildCleaCertificationScoring: _.noop(),
    save: _.noop(),
  };

  const dependencies = {
    partnerCertificationScoringRepository,
  };

  it('fails when event is not of correct type', async () => {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handleCleaCertificationScoring)(
      { event, ...dependencies },
    );

    // then
    expect(error).not.to.be.null;
  });

  context('#handleCleaCertificationScoring', () => {
    const certificationCourseId = Symbol('certificationCourseId');
    const userId = Symbol('userId');
    const cleaCertificationScoring = {};

    beforeEach(() => {
      event = new CertificationScoringCompleted({
        certificationCourseId,
        userId,
        isCertification: true,
        reproducibilityRate,
        limitDate: new Date('2018-02-03'),
      });

      partnerCertificationScoringRepository.save = sinon.stub();
      partnerCertificationScoringRepository.buildCleaCertificationScoring = sinon.stub();
      partnerCertificationScoringRepository.save.resolves();
      partnerCertificationScoringRepository.buildCleaCertificationScoring
        .withArgs({
          certificationCourseId,
          userId,
          reproducibilityRate,
        }).resolves(cleaCertificationScoring);
    });

    context('when certification is eligible', () => {

      it('it should save a certif partner', async () => {
        // given
        cleaCertificationScoring.isEligible = () => true;

        // when
        await handleCleaCertificationScoring({
          event, ...dependencies,
        });

        // then
        expect(partnerCertificationScoringRepository.save).to.have.been.calledWithMatch({
          partnerCertificationScoring: cleaCertificationScoring,
        });
      });
    });

    context('when certification is not eligible', () => {

      it('it should not save a certif partner', async () => {
        // given
        cleaCertificationScoring.isEligible = () => false;

        // when
        await handleCleaCertificationScoring({
          event, ...dependencies,
        });

        // then
        expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
      });
    });
  });
});
