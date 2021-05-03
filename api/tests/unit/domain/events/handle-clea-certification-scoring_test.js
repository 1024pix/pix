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

  const badgeRepository = {
    getByKey: _.noop(),
  };
  const knowledgeElementRepository = {
    findUniqByUserId: _.noop(),
  };
  const targetProfileRepository = {
    get: _.noop(),
  };
  const badgeCriteriaService = {
    areBadgeCriteriaFulfilled: _.noop(),
  };

  const certificationCourseRepository = {
    getCreationDate: _.noop(),
  };

  const dependencies = {
    partnerCertificationScoringRepository,
    badgeRepository,
    knowledgeElementRepository,
    certificationCourseRepository,
    targetProfileRepository,
    badgeCriteriaService,
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
    const cleaCertificationScoring = { hasAcquiredBadge: true };
    const targetProfile = { id: 'targetProfileId' };
    const badge = { targetProfileId: targetProfile.id };
    const knowledgeElements = Symbol('KnowledgeElements@& ');

    beforeEach(() => {
      event = new CertificationScoringCompleted({
        certificationCourseId,
        userId,
        isCertification: true,
        reproducibilityRate,
      });
      const date = '2021-01-01';
      certificationCourseRepository.getCreationDate = sinon.stub().withArgs(certificationCourseId).resolves(date);
      badgeRepository.getByKey = sinon.stub().resolves(badge);
      targetProfileRepository.get = sinon.stub().withArgs(targetProfile.id).resolves(targetProfile);
      knowledgeElementRepository.findUniqByUserId = sinon.stub().withArgs({ userId: event.userId, limitDate: date }).resolves(knowledgeElements);
      badgeCriteriaService.areBadgeCriteriaFulfilled = sinon.stub().withArgs({ knowledgeElements, targetProfile, badge }).returns(true);
      cleaCertificationScoring.setBadgeStillValid = sinon.stub().returns(true);

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

      it('should verify if the badge is still acquired', async () => {
        // given
        cleaCertificationScoring.isEligible = () => true;

        // when
        await handleCleaCertificationScoring({
          event, ...dependencies,
        });

        // then
        expect(badgeCriteriaService.areBadgeCriteriaFulfilled).to.have.been.calledWith({ knowledgeElements, targetProfile, badge });
        expect(cleaCertificationScoring.setBadgeStillValid).to.have.been.calledWith(true);
      });

      it('should save a certif partner', async () => {
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

      it('should not verify if the badge is still acquired if the badge is not acquired', async () => {
        // given
        cleaCertificationScoring.hasAcquiredBadge = false;
        cleaCertificationScoring.isEligible = () => true;

        // when
        await handleCleaCertificationScoring({
          event, ...dependencies,
        });

        // then
        expect(badgeCriteriaService.areBadgeCriteriaFulfilled).to.not.to.have.been.called;
        expect(cleaCertificationScoring.setBadgeStillValid).to.not.to.have.been.called;
      });

      it('should not save a certif partner', async () => {
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
