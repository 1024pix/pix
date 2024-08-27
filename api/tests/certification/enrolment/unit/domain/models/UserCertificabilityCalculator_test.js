import {
  LABEL_FOR_CORE,
  UserCertificabilityCalculator,
} from '../../../../../../src/certification/enrolment/domain/models/UserCertificabilityCalculator.js';
import { sources } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | UserCertificabilityCalculator', function () {
  context('#static buildEmpty', function () {
    it('should return an empty UserCertificabilityCalculator', function () {
      // when
      const emptyUserCertificabilityCalculator = UserCertificabilityCalculator.buildEmpty({
        userId: 123,
      });

      // then
      expect(emptyUserCertificabilityCalculator).to.deepEqualInstance(
        domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: null,
          userId: 123,
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: null,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: null,
        }),
      );
      expect(emptyUserCertificabilityCalculator.draftCertificability).to.deep.equal([
        {
          certification: LABEL_FOR_CORE,
          isCertifiable: false,
        },
      ]);
      expect(emptyUserCertificabilityCalculator.draftCertificabilityV2).to.deep.equal([
        {
          certification: LABEL_FOR_CORE,
          isCertifiable: false,
        },
      ]);
    });
  });

  context('#isUpToDate', function () {
    it('should return true when all dates are the same as the real ones', function () {
      // given
      const realLatestKnowledgeElementCreatedAt = new Date('2021-01-01');
      const realLatestCertificationDeliveredAt = new Date('2021-01-02');
      const realLatestBadgeAcquisitionUpdatedAt = new Date('2021-01-03');
      const realLatestComplementaryCertificationBadgeDetachedAt = new Date('2021-01-04');
      const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
        userId: 123,
        certificability: [{ someKey: 'some data' }],
        certificabilityV2: [{ someKeyV2: 'some data V2' }],
        latestKnowledgeElementCreatedAt: realLatestKnowledgeElementCreatedAt,
        latestCertificationDeliveredAt: realLatestCertificationDeliveredAt,
        latestBadgeAcquisitionUpdatedAt: realLatestBadgeAcquisitionUpdatedAt,
        latestComplementaryCertificationBadgeDetachedAt: realLatestComplementaryCertificationBadgeDetachedAt,
      });

      // when
      const isUpToDate = userCertificabilityCalculator.isUpToDate({
        realLatestKnowledgeElementCreatedAt,
        realLatestCertificationDeliveredAt,
        realLatestBadgeAcquisitionUpdatedAt,
        realLatestComplementaryCertificationBadgeDetachedAt,
      });

      // then
      expect(isUpToDate).to.be.true;
    });

    it('should return true when all dates are the same as the real ones even with null values', function () {
      // given
      const realLatestKnowledgeElementCreatedAt = new Date('2021-01-01');
      const realLatestCertificationDeliveredAt = null;
      const realLatestBadgeAcquisitionUpdatedAt = null;
      const realLatestComplementaryCertificationBadgeDetachedAt = new Date('2021-01-04');
      const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
        userId: 123,
        certificability: [{ someKey: 'some data' }],
        certificabilityV2: [{ someKeyV2: 'some data V2' }],
        latestKnowledgeElementCreatedAt: realLatestKnowledgeElementCreatedAt,
        latestCertificationDeliveredAt: realLatestCertificationDeliveredAt,
        latestBadgeAcquisitionUpdatedAt: realLatestBadgeAcquisitionUpdatedAt,
        latestComplementaryCertificationBadgeDetachedAt: realLatestComplementaryCertificationBadgeDetachedAt,
      });

      // when
      const isUpToDate = userCertificabilityCalculator.isUpToDate({
        realLatestKnowledgeElementCreatedAt,
        realLatestCertificationDeliveredAt,
        realLatestBadgeAcquisitionUpdatedAt,
        realLatestComplementaryCertificationBadgeDetachedAt,
      });

      // then
      expect(isUpToDate).to.be.true;
    });

    it('should return false when latestKnowledgeElementCreatedAt date has changed', function () {
      // given
      const previousLatestKnowledgeElementCreatedAt = new Date('2020-01-02');
      const realLatestKnowledgeElementCreatedAt = new Date('2020-01-01');
      const realLatestCertificationDeliveredAt = new Date('2021-01-02');
      const realLatestBadgeAcquisitionUpdatedAt = new Date('2022-05-05');
      const realLatestComplementaryCertificationBadgeDetachedAt = new Date('2023-01-01');
      const userCertificabilityCalculatorKeDifferent =
        domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          userId: 123,
          certificability: [{ someKey: 'some data' }],
          certificabilityV2: [{ someKeyV2: 'some data V2' }],
          latestKnowledgeElementCreatedAt: previousLatestKnowledgeElementCreatedAt,
          latestCertificationDeliveredAt: realLatestCertificationDeliveredAt,
          latestBadgeAcquisitionUpdatedAt: realLatestBadgeAcquisitionUpdatedAt,
          latestComplementaryCertificationBadgeDetachedAt: realLatestComplementaryCertificationBadgeDetachedAt,
        });

      // when
      const isUpToDateKeDifferent = userCertificabilityCalculatorKeDifferent.isUpToDate({
        realLatestKnowledgeElementCreatedAt,
        realLatestCertificationDeliveredAt,
        realLatestBadgeAcquisitionUpdatedAt,
        realLatestComplementaryCertificationBadgeDetachedAt,
      });

      // then
      expect(isUpToDateKeDifferent).to.be.false;
    });

    it('should return false when latestCertificationDeliveredAt date has changed', function () {
      // given
      const realLatestKnowledgeElementCreatedAt = new Date('2020-01-01');
      const previousLatestCertificationDeliveredAt = new Date('2021-01-01');
      const realLatestCertificationDeliveredAt = new Date('2021-01-02');
      const realLatestBadgeAcquisitionUpdatedAt = new Date('2022-05-05');
      const realLatestComplementaryCertificationBadgeDetachedAt = new Date('2023-01-01');
      const userCertificabilityCalculatorCertificationDifferent =
        domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          userId: 456,
          certificability: [{ someKey: 'some data' }],
          certificabilityV2: [{ someKeyV2: 'some data V2' }],
          latestKnowledgeElementCreatedAt: realLatestKnowledgeElementCreatedAt,
          latestCertificationDeliveredAt: previousLatestCertificationDeliveredAt,
          latestBadgeAcquisitionUpdatedAt: realLatestBadgeAcquisitionUpdatedAt,
          latestComplementaryCertificationBadgeDetachedAt: realLatestComplementaryCertificationBadgeDetachedAt,
        });

      // when
      const isUpToDateCertificationDifferent = userCertificabilityCalculatorCertificationDifferent.isUpToDate({
        realLatestKnowledgeElementCreatedAt,
        realLatestCertificationDeliveredAt,
        realLatestBadgeAcquisitionUpdatedAt,
        realLatestComplementaryCertificationBadgeDetachedAt,
      });

      // then
      expect(isUpToDateCertificationDifferent).to.be.false;
    });

    it('should return false when latestBadgeAcquisitionUpdatedAt date has changed', function () {
      // given
      const realLatestKnowledgeElementCreatedAt = new Date('2020-01-01');
      const realLatestCertificationDeliveredAt = new Date('2021-01-02');
      const previousLatestBadgeAcquisitionUpdatedAt = null;
      const realLatestBadgeAcquisitionUpdatedAt = new Date('2022-05-05');
      const realLatestComplementaryCertificationBadgeDetachedAt = new Date('2023-01-01');
      const userCertificabilityCalculatorBadgeAcquisitionDifferent =
        domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          userId: 789,
          certificability: [{ someKey: 'some data' }],
          certificabilityV2: [{ someKeyV2: 'some data V2' }],
          latestKnowledgeElementCreatedAt: realLatestKnowledgeElementCreatedAt,
          latestCertificationDeliveredAt: realLatestCertificationDeliveredAt,
          latestBadgeAcquisitionUpdatedAt: previousLatestBadgeAcquisitionUpdatedAt,
          latestComplementaryCertificationBadgeDetachedAt: realLatestComplementaryCertificationBadgeDetachedAt,
        });

      // when
      const isUpToDateBadgeAcquisitionDifferent = userCertificabilityCalculatorBadgeAcquisitionDifferent.isUpToDate({
        realLatestKnowledgeElementCreatedAt,
        realLatestCertificationDeliveredAt,
        realLatestBadgeAcquisitionUpdatedAt,
        realLatestComplementaryCertificationBadgeDetachedAt,
      });

      // then
      expect(isUpToDateBadgeAcquisitionDifferent).to.be.false;
    });

    it('should return false when latestComplementaryCertificationBadgeDetachedAt date has changed', function () {
      // given
      const realLatestKnowledgeElementCreatedAt = new Date('2020-01-01');
      const realLatestCertificationDeliveredAt = new Date('2021-01-02');
      const realLatestBadgeAcquisitionUpdatedAt = new Date('2022-05-05');
      const previousLatestComplementaryCertificationBadgeDetachedAt = null;
      const realLatestComplementaryCertificationBadgeDetachedAt = new Date('2023-01-01');
      const userCertificabilityCalculatorComplementaryCertificationBadgeDifferent =
        domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          userId: 789,
          certificability: [{ someKey: 'some data' }],
          certificabilityV2: [{ someKeyV2: 'some data V2' }],
          latestKnowledgeElementCreatedAt: realLatestKnowledgeElementCreatedAt,
          latestCertificationDeliveredAt: realLatestCertificationDeliveredAt,
          latestBadgeAcquisitionUpdatedAt: realLatestBadgeAcquisitionUpdatedAt,
          latestComplementaryCertificationBadgeDetachedAt: previousLatestComplementaryCertificationBadgeDetachedAt,
        });

      // when
      const isUpToDateComplementaryCertificationBadgeDifferent =
        userCertificabilityCalculatorComplementaryCertificationBadgeDifferent.isUpToDate({
          realLatestKnowledgeElementCreatedAt,
          realLatestCertificationDeliveredAt,
          realLatestBadgeAcquisitionUpdatedAt,
          realLatestComplementaryCertificationBadgeDetachedAt,
        });

      // then
      expect(isUpToDateComplementaryCertificationBadgeDifferent).to.be.false;
    });
  });

  context('#reset', function () {
    it('should reset', function () {
      // given
      const newLatestKnowledgeElementCreatedAt = new Date('2021-01-01');
      const newLatestCertificationDeliveredAt = new Date('2021-01-02');
      const newLatestBadgeAcquisitionUpdatedAt = new Date('2021-01-03');
      const newLatestComplementaryCertificationBadgeDetachedAt = new Date('2021-01-04');
      const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
        id: 1,
        userId: 123,
        certificability: [{ someKey: 'some data' }],
        certificabilityV2: [{ someKeyV2: 'some data V2' }],
        latestKnowledgeElementCreatedAt: null,
        latestCertificationDeliveredAt: new Date('2001-01-01'),
        latestBadgeAcquisitionUpdatedAt: new Date('2002-02-02'),
        latestComplementaryCertificationBadgeDetachedAt: new Date('2002-02-03'),
      });

      // when
      userCertificabilityCalculator.reset({
        newLatestKnowledgeElementCreatedAt,
        newLatestCertificationDeliveredAt,
        newLatestBadgeAcquisitionUpdatedAt,
        newLatestComplementaryCertificationBadgeDetachedAt,
      });

      // then
      expect(userCertificabilityCalculator).to.deepEqualInstance(
        domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 1,
          userId: 123,
          latestKnowledgeElementCreatedAt: newLatestKnowledgeElementCreatedAt,
          latestCertificationDeliveredAt: newLatestCertificationDeliveredAt,
          latestBadgeAcquisitionUpdatedAt: newLatestBadgeAcquisitionUpdatedAt,
          latestComplementaryCertificationBadgeDetachedAt: newLatestComplementaryCertificationBadgeDetachedAt,
        }),
      );
      expect(userCertificabilityCalculator.draftCertificability).to.deep.equal([]);
      expect(userCertificabilityCalculator.draftCertificabilityV2).to.deep.equal([]);
    });
  });

  context('#computeCoreCertificability', function () {
    let coreCompetences;
    let allKnowledgeElements;
    beforeEach(function () {
      coreCompetences = [];
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compA' }));
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compB' }));
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compC' }));
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compD' }));
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compE' }));
      allKnowledgeElements = [];
      // competence A is certificable
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compA',
          earnedPix: 2,
        }),
      );
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compA',
          earnedPix: 3,
        }),
      );
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compA',
          earnedPix: 4,
        }),
      );
      // competence B is certificable
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compB',
          earnedPix: 12,
        }),
      );
      // competence C is certificable
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compC',
          earnedPix: 7,
        }),
      );
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compC',
          earnedPix: 1,
        }),
      );
      // competence D is certificable
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compD',
          earnedPix: 25,
        }),
      );
    });

    context('for V2 AND V3 (same requirements)', function () {
      it('should compute core certificable as true when user is level 1 at 5 competences at least', function () {
        // given
        const someDate = new Date('2021-10-29');
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 1,
          userId: 123,
          certificability: [],
          certificabilityV2: [],
          latestKnowledgeElementCreatedAt: someDate,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: null,
        });

        // when
        userCertificabilityCalculator.computeCoreCertificability({ allKnowledgeElements, coreCompetences });

        // then
        expect(userCertificabilityCalculator).to.deepEqualInstance(
          domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
            id: 1,
            userId: 123,
            latestKnowledgeElementCreatedAt: someDate,
            latestCertificationDeliveredAt: someDate,
            latestBadgeAcquisitionUpdatedAt: null,
            latestComplementaryCertificationBadgeDetachedAt: null,
          }),
        );
        expect(userCertificabilityCalculator.draftCertificability).to.deep.equal([
          { certification: LABEL_FOR_CORE, isCertifiable: true },
        ]);
        expect(userCertificabilityCalculator.draftCertificabilityV2).to.deep.equal([
          { certification: LABEL_FOR_CORE, isCertifiable: true },
        ]);
      });

      it('should compute core certificable as false when user is level 1 on less than 5 competences', function () {
        // given
        const someDate = new Date('2021-10-29');
        // competence E
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 1,
          userId: 123,
          certificability: [],
          certificabilityV2: [],
          latestKnowledgeElementCreatedAt: someDate,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: null,
        });

        // when
        userCertificabilityCalculator.computeCoreCertificability({ allKnowledgeElements, coreCompetences });

        // then
        expect(userCertificabilityCalculator).to.deepEqualInstance(
          domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
            id: 1,
            userId: 123,
            latestKnowledgeElementCreatedAt: someDate,
            latestCertificationDeliveredAt: someDate,
            latestBadgeAcquisitionUpdatedAt: null,
            latestComplementaryCertificationBadgeDetachedAt: null,
          }),
        );
        expect(userCertificabilityCalculator.draftCertificability).to.deep.equal([
          {
            certification: LABEL_FOR_CORE,
            isCertifiable: false,
          },
        ]);
        expect(userCertificabilityCalculator.draftCertificabilityV2).to.deep.equal([
          {
            certification: LABEL_FOR_CORE,
            isCertifiable: false,
          },
        ]);
      });

      it('should compute core certificable as false when user is level 1 on less than 5 competences (no KE in one competence)', function () {
        // given
        const someDate = new Date('2021-10-29');
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 1,
          userId: 123,
          certificability: [],
          certificabilityV2: [],
          latestKnowledgeElementCreatedAt: someDate,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: null,
        });

        // when
        userCertificabilityCalculator.computeCoreCertificability({ allKnowledgeElements, coreCompetences });

        // then
        expect(userCertificabilityCalculator).to.deepEqualInstance(
          domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
            id: 1,
            userId: 123,
            latestKnowledgeElementCreatedAt: someDate,
            latestCertificationDeliveredAt: someDate,
            latestBadgeAcquisitionUpdatedAt: null,
            latestComplementaryCertificationBadgeDetachedAt: null,
          }),
        );
        expect(userCertificabilityCalculator.draftCertificability).to.deep.equal([
          {
            certification: LABEL_FOR_CORE,
            isCertifiable: false,
          },
        ]);
        expect(userCertificabilityCalculator.draftCertificabilityV2).to.deep.equal([
          {
            certification: LABEL_FOR_CORE,
            isCertifiable: false,
          },
        ]);
      });
    });
  });

  context('#computeComplementaryCertificabilities', function () {
    let notCleaCertifiableBadgeAcquisition;
    let cleaCertifiableBadgeAcquisition;
    let userCertificabilityCalculator;
    let someDate;
    let complementaryCertificationCourseWithResults;
    let howManyVersionsBehindByComplementaryCertificationBadgeId;

    beforeEach(function () {
      notCleaCertifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        badgeId: 111,
        badgeKey: 'PIX_POULET_MAITRE',
        campaignId: 222,
        complementaryCertificationId: 333,
        complementaryCertificationKey: 'PIX_POULET',
        complementaryCertificationBadgeId: 444,
        complementaryCertificationBadgeImageUrl: 'some_ignored_image',
        complementaryCertificationBadgeLabel: 'some_ignored_label',
        isOutdated: false,
      });
      cleaCertifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        badgeId: 555,
        badgeKey: 'CLEA_SUPER_BADGE',
        campaignId: 666,
        complementaryCertificationId: 777,
        complementaryCertificationKey: ComplementaryCertificationKeys.CLEA,
        complementaryCertificationBadgeId: 888,
        complementaryCertificationBadgeImageUrl: 'some_clea_ignored_image',
        complementaryCertificationBadgeLabel: 'some_clea_ignored_label',
        isOutdated: false,
      });
      howManyVersionsBehindByComplementaryCertificationBadgeId = {
        [cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 0,
        [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 0,
      };
      someDate = new Date('2021-10-29');
      userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
        id: 1,
        userId: 123,
        certificability: [],
        certificabilityV2: [],
        latestKnowledgeElementCreatedAt: someDate,
        latestCertificationDeliveredAt: someDate,
        latestBadgeAcquisitionUpdatedAt: null,
        latestComplementaryCertificationBadgeDetachedAt: null,
      });
      complementaryCertificationCourseWithResults = [];
    });
    context('V2', function () {
      let minimumEarnedPixValuesByComplementaryCertificationBadgeId;
      const highestPixScoreObtainedInCoreCertification = -1;

      beforeEach(function () {
        minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
          [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: -1,
          [cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: -1,
        };
      });

      context('when all criteria are fulfilled (CLEA and Others have same criteria)', function () {
        it('should compute complementary certificabilities as true along with some useful data', function () {
          // given
          userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
            ...userCertificabilityCalculator,
            certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
          });
          notCleaCertifiableBadgeAcquisition.isOutdated = false;
          cleaCertifiableBadgeAcquisition.isOutdated = false;

          // when
          userCertificabilityCalculator.computeComplementaryCertificabilities({
            certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition, cleaCertifiableBadgeAcquisition],
            minimumEarnedPixValuesByComplementaryCertificationBadgeId,
            highestPixScoreObtainedInCoreCertification,
            complementaryCertificationCourseWithResults,
            howManyVersionsBehindByComplementaryCertificationBadgeId,
          });

          // then
          sinon.assert.match(userCertificabilityCalculator, {
            id: 1,
            userId: 123,
            draftCertificability: sinon.match.any,
            draftCertificabilityV2: [
              { certification: LABEL_FOR_CORE, isCertifiable: true },
              {
                certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                isCertifiable: true,
                complementaryCertificationBadgeId: notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                why: { isOutdated: false, isCoreCertifiable: true },
                info: sinon.match.any,
              },
              {
                certification: cleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                isCertifiable: true,
                complementaryCertificationBadgeId: cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                complementaryCertificationId: cleaCertifiableBadgeAcquisition.complementaryCertificationId,
                campaignId: cleaCertifiableBadgeAcquisition.campaignId,
                badgeKey: cleaCertifiableBadgeAcquisition.badgeKey,
                why: { isOutdated: false, isCoreCertifiable: true },
                info: sinon.match.any,
              },
            ],
            latestKnowledgeElementCreatedAt: someDate,
            latestCertificationDeliveredAt: someDate,
            latestBadgeAcquisitionUpdatedAt: null,
            latestComplementaryCertificationBadgeDetachedAt: null,
          });
        });
      });
      context('when one criterion is not fulfilled', function () {
        it('should compute complementary certificabilities as false when user not pix certifiable', function () {
          // given
          userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
            ...userCertificabilityCalculator,
            certificabilityV2: [{ certification: 'SomethingElse', isCertifiable: true }],
          });
          notCleaCertifiableBadgeAcquisition.isOutdated = false;
          cleaCertifiableBadgeAcquisition.isOutdated = false;

          // when
          userCertificabilityCalculator.computeComplementaryCertificabilities({
            certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition, cleaCertifiableBadgeAcquisition],
            minimumEarnedPixValuesByComplementaryCertificationBadgeId,
            highestPixScoreObtainedInCoreCertification,
            complementaryCertificationCourseWithResults,
            howManyVersionsBehindByComplementaryCertificationBadgeId,
          });

          // then
          sinon.assert.match(userCertificabilityCalculator, {
            id: 1,
            userId: 123,
            draftCertificability: sinon.match.any,
            draftCertificabilityV2: [
              { certification: 'SomethingElse', isCertifiable: true },
              {
                certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                isCertifiable: false,
                complementaryCertificationBadgeId: notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                why: { isOutdated: false, isCoreCertifiable: false },
                info: sinon.match.any,
              },
              {
                certification: cleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                isCertifiable: false,
                complementaryCertificationBadgeId: cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                complementaryCertificationId: cleaCertifiableBadgeAcquisition.complementaryCertificationId,
                campaignId: cleaCertifiableBadgeAcquisition.campaignId,
                badgeKey: cleaCertifiableBadgeAcquisition.badgeKey,
                why: { isOutdated: false, isCoreCertifiable: false },
                info: sinon.match.any,
              },
            ],
            latestKnowledgeElementCreatedAt: someDate,
            latestCertificationDeliveredAt: someDate,
            latestBadgeAcquisitionUpdatedAt: null,
            latestComplementaryCertificationBadgeDetachedAt: null,
          });
        });
        it('should compute complementary certificabilities as false when badge acquisition is outdated (because complementary has been detached)', function () {
          // given
          userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
            ...userCertificabilityCalculator,
            certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
          });
          notCleaCertifiableBadgeAcquisition.isOutdated = true;
          cleaCertifiableBadgeAcquisition.isOutdated = true;

          // when
          userCertificabilityCalculator.computeComplementaryCertificabilities({
            certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition, cleaCertifiableBadgeAcquisition],
            minimumEarnedPixValuesByComplementaryCertificationBadgeId,
            highestPixScoreObtainedInCoreCertification,
            complementaryCertificationCourseWithResults,
            howManyVersionsBehindByComplementaryCertificationBadgeId,
          });

          // then
          sinon.assert.match(userCertificabilityCalculator, {
            id: 1,
            userId: 123,
            draftCertificability: sinon.match.any,
            draftCertificabilityV2: [
              { certification: LABEL_FOR_CORE, isCertifiable: true },
              {
                certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                isCertifiable: false,
                complementaryCertificationBadgeId: notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                why: { isOutdated: true, isCoreCertifiable: true },
                info: sinon.match.any,
              },
              {
                certification: cleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                isCertifiable: false,
                complementaryCertificationBadgeId: cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                complementaryCertificationId: cleaCertifiableBadgeAcquisition.complementaryCertificationId,
                campaignId: cleaCertifiableBadgeAcquisition.campaignId,
                badgeKey: cleaCertifiableBadgeAcquisition.badgeKey,
                why: { isOutdated: true, isCoreCertifiable: true },
                info: sinon.match.any,
              },
            ],
            latestKnowledgeElementCreatedAt: someDate,
            latestCertificationDeliveredAt: someDate,
            latestBadgeAcquisitionUpdatedAt: null,
            latestComplementaryCertificationBadgeDetachedAt: null,
          });
        });
      });
      context('"info" section', function () {
        context('"hasComplementaryCertificationForThisLevel"', function () {
          it('should return true when user has a validated complementary certification for the badge', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            complementaryCertificationCourseWithResults = [
              domainBuilder.buildComplementaryCertificationCourseWithResults({
                complementaryCertificationBadgeId: notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                results: [
                  {
                    source: sources.PIX,
                    acquired: true,
                    complementaryCertificationBadgeId:
                      notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  },
                ],
              }),
            ];

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: sinon.match.any,
              draftCertificabilityV2: [
                { certification: LABEL_FOR_CORE, isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: false, isCoreCertifiable: true },
                  info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 0 },
                },
              ],
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
          it('should return false when user has not a validated complementary certification for the badge', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            complementaryCertificationCourseWithResults = [
              domainBuilder.buildComplementaryCertificationCourseWithResults({
                complementaryCertificationBadgeId: notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                results: [
                  {
                    source: sources.PIX,
                    acquired: true,
                    complementaryCertificationBadgeId: 'someOtherLevelBadgeId',
                  },
                ],
              }),
            ];

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: sinon.match.any,
              draftCertificabilityV2: [
                { certification: LABEL_FOR_CORE, isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: false, isCoreCertifiable: true },
                  info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
                },
              ],
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
        });
        context('"versionsBehind"', function () {
          it('should return the number of versions behind is the complementary certification badge', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            howManyVersionsBehindByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 3,
            };

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: sinon.match.any,
              draftCertificabilityV2: [
                { certification: LABEL_FOR_CORE, isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: false, isCoreCertifiable: true },
                  info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 3 },
                },
              ],
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
          it('should return false when user has not a validated complementary certification for the badge', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            complementaryCertificationCourseWithResults = [
              domainBuilder.buildComplementaryCertificationCourseWithResults({
                complementaryCertificationBadgeId: notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                results: [
                  {
                    source: sources.PIX,
                    acquired: true,
                    complementaryCertificationBadgeId: 'someOtherLevelBadgeId',
                  },
                ],
              }),
            ];

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: sinon.match.any,
              draftCertificabilityV2: [
                { certification: LABEL_FOR_CORE, isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: false, isCoreCertifiable: true },
                  info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
                },
              ],
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
        });
      });
    });

    context('V3', function () {
      context('CLEA', function () {
        let minimumEarnedPixValuesByComplementaryCertificationBadgeId;
        const highestPixScoreObtainedInCoreCertification = -1;

        beforeEach(function () {
          minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
            [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: -1,
            [cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: -1,
          };
        });
        context('when all criteria are fulfilled', function () {
          it('should compute complementary certificability as true along with some useful data', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
            });
            cleaCertifiableBadgeAcquisition.isOutdated = false;

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [cleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: LABEL_FOR_CORE, isCertifiable: true },
                {
                  certification: cleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId: cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: cleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: cleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: cleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: false, isCoreCertifiable: true },
                  info: sinon.match.any,
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
        });
        context('when one criterion is not fulfilled', function () {
          it('should compute complementary certificability as false when user not pix certifiable', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: 'SomethingElse', isCertifiable: true }],
            });
            cleaCertifiableBadgeAcquisition.isOutdated = false;

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [cleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: 'SomethingElse', isCertifiable: true },
                {
                  certification: cleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: false,
                  complementaryCertificationBadgeId: cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: cleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: cleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: cleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: false, isCoreCertifiable: false },
                  info: sinon.match.any,
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
          it('should compute complementary certificability as false when badge acquisition is outdated (because complementary has been detached)', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
            });
            cleaCertifiableBadgeAcquisition.isOutdated = true;

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [cleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: LABEL_FOR_CORE, isCertifiable: true },
                {
                  certification: cleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: false,
                  complementaryCertificationBadgeId: cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: cleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: cleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: cleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: true, isCoreCertifiable: true },
                  info: sinon.match.any,
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
        });
      });
      context('Not CLEA', function () {
        context('when all criteria are fulfilled', function () {
          it('should compute complementary certificability as true along with some useful data', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: 'ItDoesNotMatter', isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 60,
              222222: 80,
            };
            const highestPixScoreObtainedInCoreCertification = 70;

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: 'ItDoesNotMatter', isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: {
                    isOutdated: false,
                    hasObtainedCoreCertification: true,
                    hasMinimumRequiredScoreForComplementaryCertification: true,
                  },
                  info: sinon.match.any,
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
          it('should compute complementary certificability as true even if highest score in pix certification is exactly the amount required', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: 'ItDoesNotMatter', isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 57,
              222222: 80,
            };
            const highestPixScoreObtainedInCoreCertification = 57;

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: 'ItDoesNotMatter', isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: {
                    isOutdated: false,
                    hasObtainedCoreCertification: true,
                    hasMinimumRequiredScoreForComplementaryCertification: true,
                  },
                  info: sinon.match.any,
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
        });
        context('when one criterion is not fulfilled', function () {
          it('should compute complementary certificability as false when badge acquisition is outdated (because complementary has been detached)', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: 'ItDoesNotMatter', isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = true;
            const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 60,
              222222: 80,
            };
            const highestPixScoreObtainedInCoreCertification = 70;

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: 'ItDoesNotMatter', isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: false,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: {
                    isOutdated: true,
                    hasObtainedCoreCertification: true,
                    hasMinimumRequiredScoreForComplementaryCertification: true,
                  },
                  info: sinon.match.any,
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
          it('should compute complementary certificability as false when minimum earned pix requirement for given complementary certification has not been reached by the user in the past during a pix certification', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: 'ItDoesNotMatter', isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 60,
              222222: 80,
            };
            const highestPixScoreObtainedInCoreCertification = 30;

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: 'ItDoesNotMatter', isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: false,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: {
                    isOutdated: false,
                    hasObtainedCoreCertification: true,
                    hasMinimumRequiredScoreForComplementaryCertification: false,
                  },
                  info: sinon.match.any,
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
          it('should compute complementary certificability as false when user did not even validated a pix certification (represented by a negative highestPixScore)', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: 'ItDoesNotMatter', isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 0,
              222222: 80,
            };
            const highestPixScoreObtainedInCoreCertification = -1;

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: 'ItDoesNotMatter', isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: false,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: {
                    isOutdated: false,
                    hasObtainedCoreCertification: false,
                    hasMinimumRequiredScoreForComplementaryCertification: false,
                  },
                  info: sinon.match.any,
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
        });
      });
      context('"info" section', function () {
        context('"hasComplementaryCertificationForThisLevel"', function () {
          it('should return true when user has a validated complementary certification for the badge', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: 'ItDoesNotMatter', isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 60,
              222222: 80,
            };
            const highestPixScoreObtainedInCoreCertification = 70;
            complementaryCertificationCourseWithResults = [
              domainBuilder.buildComplementaryCertificationCourseWithResults({
                complementaryCertificationBadgeId: notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                results: [
                  {
                    source: sources.PIX,
                    acquired: true,
                    complementaryCertificationBadgeId:
                      notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  },
                ],
              }),
            ];

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: 'ItDoesNotMatter', isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: {
                    isOutdated: false,
                    hasObtainedCoreCertification: true,
                    hasMinimumRequiredScoreForComplementaryCertification: true,
                  },
                  info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 0 },
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
          it('should return false when user has a not validated complementary certification for the badge', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: 'ItDoesNotMatter', isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 60,
              222222: 80,
            };
            const highestPixScoreObtainedInCoreCertification = 70;
            complementaryCertificationCourseWithResults = [
              domainBuilder.buildComplementaryCertificationCourseWithResults({
                complementaryCertificationBadgeId: notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                results: [
                  {
                    source: sources.PIX,
                    acquired: true,
                    complementaryCertificationBadgeId: 'someOtherLevelBadgeId',
                  },
                ],
              }),
            ];

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: 'ItDoesNotMatter', isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: {
                    isOutdated: false,
                    hasObtainedCoreCertification: true,
                    hasMinimumRequiredScoreForComplementaryCertification: true,
                  },
                  info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
        });
        context('"versionsBehind"', function () {
          it('should return the number of versions behind is the complementary certification badge', function () {
            // given
            userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
              ...userCertificabilityCalculator,
              certificability: [{ certification: 'ItDoesNotMatter', isCertifiable: true }],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 60,
              222222: 80,
            };
            const highestPixScoreObtainedInCoreCertification = 70;
            howManyVersionsBehindByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 5,
            };

            // when
            userCertificabilityCalculator.computeComplementaryCertificabilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              minimumEarnedPixValuesByComplementaryCertificationBadgeId,
              highestPixScoreObtainedInCoreCertification,
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userCertificabilityCalculator, {
              id: 1,
              userId: 123,
              draftCertificability: [
                { certification: 'ItDoesNotMatter', isCertifiable: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: {
                    isOutdated: false,
                    hasObtainedCoreCertification: true,
                    hasMinimumRequiredScoreForComplementaryCertification: true,
                  },
                  info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 5 },
                },
              ],
              draftCertificabilityV2: sinon.match.any,
              latestKnowledgeElementCreatedAt: someDate,
              latestCertificationDeliveredAt: someDate,
              latestBadgeAcquisitionUpdatedAt: null,
              latestComplementaryCertificationBadgeDetachedAt: null,
            });
          });
        });
      });
    });
  });

  context('#buildUserCertificability', function () {
    context('when calculator is not calculating', function () {
      it('should return a UserCertificability because it was up to date', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 'whoCares',
          userId: 123,
          certificability: [{ superKey: 'superval' }],
          certificabilityV2: [{ superKey: 'superval2' }],
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: someDate,
        });
        userCertificabilityCalculator.isUpToDate({
          realLatestKnowledgeElementCreatedAt: null,
          realLatestCertificationDeliveredAt: someDate,
          realLatestBadgeAcquisitionUpdatedAt: null,
          realLatestComplementaryCertificationBadgeDetachedAt: someDate,
        });

        // when
        const userCertificability = userCertificabilityCalculator.buildUserCertificability();

        // then
        expect(userCertificability).to.deepEqualInstance(
          domainBuilder.certification.enrolment.buildUserCertificability({
            userId: 123,
            certificability: [{ superKey: 'superval' }],
            certificabilityV2: [{ superKey: 'superval2' }],
          }),
        );
      });
      it('should return a UserCertificability because it certificabilities were all calculated', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 'whoCares',
          userId: 123,
          certificability: [{ superKey: 'superval' }],
          certificabilityV2: [{ superKey: 'superval2' }],
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: someDate,
        });
        userCertificabilityCalculator.computeCoreCertificability({
          allKnowledgeElements: [],
          coreCompetences: [],
        });
        userCertificabilityCalculator.computeComplementaryCertificabilities({
          certifiableBadgeAcquisitions: [],
        });

        // when
        const userCertificability = userCertificabilityCalculator.buildUserCertificability();

        // then
        expect(userCertificability).to.deepEqualInstance(
          domainBuilder.certification.enrolment.buildUserCertificability({
            userId: 123,
            certificability: [{ superKey: 'superval' }],
            certificabilityV2: [{ superKey: 'superval2' }],
          }),
        );
      });
    });
    context('when calculator is calculating', function () {
      it('should return a null because it was not up to date', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 'whoCares',
          userId: 123,
          certificability: [{ superKey: 'superval' }],
          certificabilityV2: [{ superKey: 'superval2' }],
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: someDate,
        });
        userCertificabilityCalculator.isUpToDate({
          realLatestKnowledgeElementCreatedAt: null,
          realLatestCertificationDeliveredAt: null,
          realLatestBadgeAcquisitionUpdatedAt: null,
          realLatestComplementaryCertificationBadgeDetachedAt: null,
        });

        // when
        const userCertificability = userCertificabilityCalculator.buildUserCertificability();

        // then
        expect(userCertificability).to.be.null;
      });
      it('should return a null because no certificabilities were calculated', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 'whoCares',
          userId: 123,
          certificability: [{ superKey: 'superval' }],
          certificabilityV2: [{ superKey: 'superval2' }],
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: someDate,
        });

        // when
        const userCertificability = userCertificabilityCalculator.buildUserCertificability();

        // then
        expect(userCertificability).to.be.null;
      });
      it('should return a null because only core was calculated', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 'whoCares',
          userId: 123,
          certificability: [{ superKey: 'superval' }],
          certificabilityV2: [{ superKey: 'superval2' }],
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: someDate,
        });
        userCertificabilityCalculator.computeCoreCertificability({
          allKnowledgeElements: [],
          coreCompetences: [],
        });

        // when
        const userCertificability = userCertificabilityCalculator.buildUserCertificability();

        // then
        expect(userCertificability).to.be.null;
      });
      it('should return a null because only complementaries were calculated', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 'whoCares',
          userId: 123,
          certificability: [{ superKey: 'superval' }],
          certificabilityV2: [{ superKey: 'superval2' }],
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: someDate,
        });
        userCertificabilityCalculator.computeComplementaryCertificabilities({
          certifiableBadgeAcquisitions: [],
        });

        // when
        const userCertificability = userCertificabilityCalculator.buildUserCertificability();

        // then
        expect(userCertificability).to.be.null;
      });
    });
  });
});
