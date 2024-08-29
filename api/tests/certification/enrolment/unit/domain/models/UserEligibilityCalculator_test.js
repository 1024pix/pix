import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';
import { UserEligibilityList } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';
import { sources } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { catchErrSync, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | UserEligibilityCalculator', function () {
  context('#computeCoreEligibility', function () {
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
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });

        // when
        userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements, coreCompetences });

        // then
        expect(userEligibilityCalculator.toDTO()).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: false }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true }],
        });
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
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });

        // when
        userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements, coreCompetences });

        // then
        expect(userEligibilityCalculator.toDTO()).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: false }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: true }],
        });
      });

      it('should compute core certifiable as false when user is level 1 on less than 5 competences (no KE in one competence)', function () {
        // given
        const someDate = new Date('2021-10-29');
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });

        // when
        userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements, coreCompetences });

        // then
        expect(userEligibilityCalculator.toDTO()).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: false }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: true }],
        });
      });
    });
  });

  describe('#computeComplementaryEligibilities', function () {
    let notCleaCertifiableBadgeAcquisition;
    let cleaCertifiableBadgeAcquisition;
    let complementaryCertificationCourseWithResults;
    let howManyVersionsBehindByComplementaryCertificationBadgeId;
    const userId = 66;
    let someDate;

    beforeEach(function () {
      someDate = new Date('1990-01-04');
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
      complementaryCertificationCourseWithResults = [];
      howManyVersionsBehindByComplementaryCertificationBadgeId = {
        [cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 0,
        [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 0,
      };
    });

    context('V2', function () {
      context('when all criteria are fulfilled for eligibility (CLEA or any other)', function () {
        it('should compute complementary eligibilities as certifiable along with some useful data', function () {
          // given
          const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
            userId,
            date: someDate,
            eligibilitiesV2: [
              domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
            ],
          });
          notCleaCertifiableBadgeAcquisition.isOutdated = false;
          cleaCertifiableBadgeAcquisition.isOutdated = false;

          // when
          userEligibilityCalculator.computeComplementaryEligibilities({
            certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition, cleaCertifiableBadgeAcquisition],
            complementaryCertificationCourseWithResults,
            howManyVersionsBehindByComplementaryCertificationBadgeId,
          });

          // then
          sinon.assert.match(userEligibilityCalculator.toDTO(), {
            userId,
            date: someDate,
            eligibilities: sinon.match.any,
            eligibilitiesV2: [
              { certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true },
              {
                certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                isCertifiable: true,
                isV2: true,
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
                isV2: true,
                complementaryCertificationBadgeId: cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                complementaryCertificationId: cleaCertifiableBadgeAcquisition.complementaryCertificationId,
                campaignId: cleaCertifiableBadgeAcquisition.campaignId,
                badgeKey: cleaCertifiableBadgeAcquisition.badgeKey,
                why: { isOutdated: false, isCoreCertifiable: true },
                info: sinon.match.any,
              },
            ],
          });
        });
      });
      context('when user is not eligible for pix certification', function () {
        it('should compute complementary eligibilities as not certifiable', function () {
          // given
          const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
            userId,
            date: someDate,
            eligibilitiesV2: [
              domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: false, isV2: true }),
            ],
          });
          notCleaCertifiableBadgeAcquisition.isOutdated = false;
          cleaCertifiableBadgeAcquisition.isOutdated = false;

          // when
          userEligibilityCalculator.computeComplementaryEligibilities({
            certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition, cleaCertifiableBadgeAcquisition],
            complementaryCertificationCourseWithResults,
            howManyVersionsBehindByComplementaryCertificationBadgeId,
          });

          // then
          sinon.assert.match(userEligibilityCalculator.toDTO(), {
            userId,
            date: someDate,
            eligibilities: sinon.match.any,
            eligibilitiesV2: [
              { certification: LABEL_FOR_CORE, isCertifiable: false, isV2: true },
              {
                certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                isCertifiable: false,
                isV2: true,
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
                isV2: true,
                complementaryCertificationBadgeId: cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                complementaryCertificationId: cleaCertifiableBadgeAcquisition.complementaryCertificationId,
                campaignId: cleaCertifiableBadgeAcquisition.campaignId,
                badgeKey: cleaCertifiableBadgeAcquisition.badgeKey,
                why: { isOutdated: false, isCoreCertifiable: false },
                info: sinon.match.any,
              },
            ],
          });
        });
      });
      context('when user certifiable badge acquisition is outdated', function () {
        it('should compute complementary eligibilities as not certifiable', function () {
          // given
          const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
            userId,
            date: someDate,
            eligibilitiesV2: [
              domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
            ],
          });
          notCleaCertifiableBadgeAcquisition.isOutdated = true;
          cleaCertifiableBadgeAcquisition.isOutdated = true;

          // when
          userEligibilityCalculator.computeComplementaryEligibilities({
            certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition, cleaCertifiableBadgeAcquisition],
            complementaryCertificationCourseWithResults,
            howManyVersionsBehindByComplementaryCertificationBadgeId,
          });

          // then
          sinon.assert.match(userEligibilityCalculator.toDTO(), {
            userId,
            date: someDate,
            eligibilities: sinon.match.any,
            eligibilitiesV2: [
              { certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true },
              {
                certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                isCertifiable: false,
                isV2: true,
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
                isV2: true,
                complementaryCertificationBadgeId: cleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                complementaryCertificationId: cleaCertifiableBadgeAcquisition.complementaryCertificationId,
                campaignId: cleaCertifiableBadgeAcquisition.campaignId,
                badgeKey: cleaCertifiableBadgeAcquisition.badgeKey,
                why: { isOutdated: true, isCoreCertifiable: true },
                info: sinon.match.any,
              },
            ],
          });
        });
      });
      context('"info" section', function () {
        context('"hasComplementaryCertificationForThisLevel"', function () {
          it('should return true when user has a validated complementary certification for the badge', function () {
            // given
            const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
              userId,
              date: someDate,
              eligibilitiesV2: [
                domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
              ],
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
            userEligibilityCalculator.computeComplementaryEligibilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userEligibilityCalculator.toDTO(), {
              userId,
              date: someDate,
              eligibilities: sinon.match.any,
              eligibilitiesV2: [
                { certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  isV2: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: false, isCoreCertifiable: true },
                  info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 0 },
                },
              ],
            });
          });
          it('should return false when user has not a validated complementary certification for the badge', function () {
            // given
            const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
              userId,
              date: someDate,
              eligibilitiesV2: [
                domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
              ],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;
            complementaryCertificationCourseWithResults = [
              domainBuilder.buildComplementaryCertificationCourseWithResults({
                complementaryCertificationBadgeId: notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                results: [
                  {
                    source: sources.PIX,
                    acquired: true,
                    complementaryCertificationBadgeId: 'someOtherBadgeId',
                  },
                ],
              }),
            ];

            // when
            userEligibilityCalculator.computeComplementaryEligibilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userEligibilityCalculator.toDTO(), {
              userId,
              date: someDate,
              eligibilities: sinon.match.any,
              eligibilitiesV2: [
                { certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  isV2: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: false, isCoreCertifiable: true },
                  info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
                },
              ],
            });
          });
        });
        context('"versionsBehind"', function () {
          it('should return the number of versions behind is the complementary certification badge', function () {
            howManyVersionsBehindByComplementaryCertificationBadgeId = {
              [notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId]: 3,
            };
            // given
            const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
              userId,
              date: someDate,
              eligibilitiesV2: [
                domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
              ],
            });
            notCleaCertifiableBadgeAcquisition.isOutdated = false;

            // when
            userEligibilityCalculator.computeComplementaryEligibilities({
              certifiableBadgeAcquisitions: [notCleaCertifiableBadgeAcquisition],
              complementaryCertificationCourseWithResults,
              howManyVersionsBehindByComplementaryCertificationBadgeId,
            });

            // then
            sinon.assert.match(userEligibilityCalculator.toDTO(), {
              userId,
              date: someDate,
              eligibilities: sinon.match.any,
              eligibilitiesV2: [
                { certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true },
                {
                  certification: notCleaCertifiableBadgeAcquisition.complementaryCertificationKey,
                  isCertifiable: true,
                  isV2: true,
                  complementaryCertificationBadgeId:
                    notCleaCertifiableBadgeAcquisition.complementaryCertificationBadgeId,
                  complementaryCertificationId: notCleaCertifiableBadgeAcquisition.complementaryCertificationId,
                  campaignId: notCleaCertifiableBadgeAcquisition.campaignId,
                  badgeKey: notCleaCertifiableBadgeAcquisition.badgeKey,
                  why: { isOutdated: false, isCoreCertifiable: true },
                  info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 3 },
                },
              ],
            });
          });
        });
      });
    });
  });

  context('#buildUserEligibilityList', function () {
    context('when computing is not done', function () {
      it('should throw an Error stating that computing is not done', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });

        // when
        const error = catchErrSync(userEligibilityCalculator.buildUserEligibilityList, userEligibilityCalculator)();

        // then
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.equal('Cannot produce final UserEligibilityList before computing them.');
      });

      it('should return a UserEligibilityList because computing is done', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });
        userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements: [], coreCompetences: [] });
        userEligibilityCalculator.computeComplementaryEligibilities({
          certifiableBadgeAcquisitions: [],
          complementaryCertificationCourseWithResults: [],
          howManyVersionsBehindByComplementaryCertificationBadgeId: {},
        });

        // when
        const userEligibilityList = userEligibilityCalculator.buildUserEligibilityList();

        // then
        expect(userEligibilityList).to.be.instanceOf(UserEligibilityList);
        expect(userEligibilityList.toDTO()).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: false }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: true }],
        });
      });
    });
  });

  context('#toDTO', function () {
    it('should return model as DTO', function () {
      // given
      const someDate = new Date('2020-01-01');
      const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
        userId: 123,
        date: someDate,
        eligibilities: [
          domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: false }),
        ],
        eligibilitiesV2: [
          domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
        ],
      });

      // when
      const DTO = userEligibilityCalculator.toDTO();

      // then
      expect(DTO).to.deep.equal({
        userId: 123,
        date: someDate,
        eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: false }],
        eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true }],
      });
    });
  });
});
