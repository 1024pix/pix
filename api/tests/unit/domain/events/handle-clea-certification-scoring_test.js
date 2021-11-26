const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');
const { handleCleaCertificationScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const { CLEA } = require('../../../../lib/domain/models/ComplementaryCertification');

describe('Unit | Domain | Events | handle-clea-certification-scoring', function () {
  let partnerCertificationScoringRepository;
  let certificationCourseRepository;
  let badgeRepository;
  let knowledgeElementRepository;
  let targetProfileRepository;
  let badgeCriteriaService;
  let complementaryCertificationCourseRepository;

  beforeEach(function () {
    partnerCertificationScoringRepository = {
      buildCleaCertificationScoring: sinon.stub(),
      save: sinon.stub(),
    };

    badgeRepository = {
      getByKey: sinon.stub(),
    };

    knowledgeElementRepository = {
      findUniqByUserId: sinon.stub(),
    };

    targetProfileRepository = {
      get: sinon.stub(),
    };

    badgeCriteriaService = {
      areBadgeCriteriaFulfilled: sinon.stub(),
    };

    certificationCourseRepository = {
      getCreationDate: sinon.stub(),
    };

    complementaryCertificationCourseRepository = { hasComplementaryCertification: sinon.stub() };
  });

  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handleCleaCertificationScoring)({
      event,
      partnerCertificationScoringRepository,
      badgeRepository,
      knowledgeElementRepository,
      certificationCourseRepository,
      targetProfileRepository,
      badgeCriteriaService,
      complementaryCertificationCourseRepository,
    });

    // then
    expect(error).not.to.be.null;
  });

  context('#handleCleaCertificationScoring', function () {
    context('when cleA certification has been started', function () {
      it('should save a certif partner', async function () {
        // given
        const userId = 1234;
        const certificationCourseId = 4567;
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ userId }),
          domainBuilder.buildKnowledgeElement({ userId }),
        ];
        const cleaCertificationScoring = domainBuilder.buildCleaCertificationScoring({
          reproducibilityRate: 85,
          hasAcquiredBadge: true,
        });
        const targetProfile = domainBuilder.buildTargetProfile({ id: 34435 });
        const badge = domainBuilder.buildBadge({ targetProfileId: 34435 });
        const event = new CertificationScoringCompleted({
          certificationCourseId,
          userId,
          isCertification: true,
          reproducibilityRate: 85,
        });
        const date = '2021-01-01';

        partnerCertificationScoringRepository.buildCleaCertificationScoring
          .withArgs({
            certificationCourseId,
            userId,
            reproducibilityRate: 85,
          })
          .resolves(cleaCertificationScoring);

        certificationCourseRepository.getCreationDate.withArgs(certificationCourseId).resolves(date);

        badgeRepository.getByKey.resolves(badge);

        targetProfileRepository.get.withArgs(34435).resolves(targetProfile);

        knowledgeElementRepository.findUniqByUserId
          .withArgs({ userId: event.userId, limitDate: date })
          .resolves(knowledgeElements);

        badgeCriteriaService.areBadgeCriteriaFulfilled
          .withArgs({ knowledgeElements, targetProfile, badge })
          .returns(true);

        complementaryCertificationCourseRepository.hasComplementaryCertification
          .withArgs({
            certificationCourseId,
            complementaryCertificationName: CLEA,
          })
          .resolves(true);

        // when
        await handleCleaCertificationScoring({
          event,
          partnerCertificationScoringRepository,
          badgeRepository,
          knowledgeElementRepository,
          certificationCourseRepository,
          targetProfileRepository,
          badgeCriteriaService,
          complementaryCertificationCourseRepository,
        });

        // then
        expect(partnerCertificationScoringRepository.save).to.have.been.calledWithMatch({
          partnerCertificationScoring: cleaCertificationScoring,
        });
      });
    });

    context('when cleA certification has not been started', function () {
      it('should not save a certif partner', async function () {
        // given
        const userId = 1234;
        const certificationCourseId = 4567;
        complementaryCertificationCourseRepository.hasComplementaryCertification
          .withArgs({
            certificationCourseId,
            complementaryCertificationName: CLEA,
          })
          .resolves(false);

        const event = new CertificationScoringCompleted({
          certificationCourseId,
          userId,
          isCertification: true,
          reproducibilityRate: 85,
        });

        // when
        await handleCleaCertificationScoring({
          event,
          partnerCertificationScoringRepository,
          badgeRepository,
          knowledgeElementRepository,
          certificationCourseRepository,
          targetProfileRepository,
          badgeCriteriaService,
          complementaryCertificationCourseRepository,
        });

        // then
        expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
      });
    });
  });
});
