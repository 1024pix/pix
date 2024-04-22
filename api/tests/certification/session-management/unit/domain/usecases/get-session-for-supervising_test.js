import dayjs from 'dayjs';

import { getSessionForSupervising } from '../../../../../../src/certification/session-management/domain/usecases/get-session-for-supervising.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../../src/certification/shared/domain/constants.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const START_DATETIME_STUB = new Date('2022-10-01T13:00:00Z');
const COMPLEMENTARY_EXTRATIME_STUB = 45;
const sessionForSupervisingRepository = { get: sinon.stub() };
const temporaryCompanionStorageService = { getBySessionId: sinon.stub() };

const expectedSessionEndDateTimeFromStartDateTime = (startDateTime, extraMinutes = []) => {
  let computedEndDateTime = dayjs(startDateTime);
  extraMinutes.forEach((plusMinutes) => {
    computedEndDateTime = computedEndDateTime.add(plusMinutes, 'minute');
  });
  return computedEndDateTime.toDate();
};

describe('Unit | UseCase | get-session-for-supervising', function () {
  context('when the session exists', function () {
    context('when there are candidates', function () {
      context('when the session has not started yet', function () {
        it('should not compute a theorical end datetime', async function () {
          // given
          const certificationCandidateNotStarted = domainBuilder.buildCertificationCandidateForSupervising();
          delete certificationCandidateNotStarted.startDateTime;

          const session = domainBuilder.buildSessionForSupervising({
            certificationCandidates: [certificationCandidateNotStarted],
          });
          sessionForSupervisingRepository.get.resolves(session);
          temporaryCompanionStorageService.getBySessionId.withArgs(1).resolves([]);

          // when
          const sessionForSupervising = await getSessionForSupervising({
            sessionId: 1,
            sessionForSupervisingRepository,
            temporaryCompanionStorageService,
          });
          // then
          expect(sessionForSupervising.certificationCandidates).to.have.lengthOf(1);
          expect(sessionForSupervising.certificationCandidates[0].startDateTime).to.be.undefined;
          expect(sessionForSupervising.certificationCandidates[0].theoricalEndDateTime).to.be.undefined;
        });
      });

      context('when the candidates have no complementary certifications', function () {
        context('when the session has started', function () {
          it('should get certification candidates with theorical end datetime and companion status', async function () {
            // given
            const sessionId = 1;
            const certificationCandidateId = 51;
            const certificationCandidateWithNoComplementaryCertification =
              domainBuilder.buildCertificationCandidateForSupervising({
                id: certificationCandidateId,
                complementaryCertification: undefined,
                complementaryCertificationKey: undefined,
              });

            const session = domainBuilder.buildSessionForSupervising({
              sessionId,
              certificationCandidates: [certificationCandidateWithNoComplementaryCertification],
            });
            sessionForSupervisingRepository.get.resolves(session);
            const expectedTheoricalEndDateTime = dayjs(
              certificationCandidateWithNoComplementaryCertification.startDateTime,
            )
              .add(DEFAULT_SESSION_DURATION_MINUTES, 'minute')
              .toDate();

            const temporaryCompanionStorageService = { getBySessionId: sinon.stub() };
            temporaryCompanionStorageService.getBySessionId.withArgs(sessionId).resolves([certificationCandidateId]);

            // when
            const { certificationCandidates } = await getSessionForSupervising({
              sessionId,
              sessionForSupervisingRepository,
              temporaryCompanionStorageService,
            });
            // then
            const [certificationCandidate] = certificationCandidates;
            expect(certificationCandidate).to.have.deep.property(
              'startDateTime',
              certificationCandidateWithNoComplementaryCertification.startDateTime,
            );
            expect(certificationCandidate).to.have.deep.property('theoricalEndDateTime', expectedTheoricalEndDateTime);
            expect(certificationCandidate).to.have.deep.property('isCompanionActive', true);
          });
        });
      });

      context('when the candidates have complementary certifications', function () {
        context('when some candidates are still eligible to complementary certifications', function () {
          it("should return the session with the candidates' eligibility", async function () {
            // given
            const stillValidBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
              complementaryCertificationKey: 'aKey',
              complementaryCertificationBadgeLabel: 'une certif complémentaire',
            });

            const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
              key: 'aKey',
              label: 'une certif complémentaire',
              certificationExtraTime: COMPLEMENTARY_EXTRATIME_STUB,
            });

            const retrievedSessionForSupervising = domainBuilder.buildSessionForSupervising({
              certificationCandidates: [
                domainBuilder.buildCertificationCandidateForSupervising({
                  userId: 1234,
                  startDateTime: START_DATETIME_STUB,
                  enrolledComplementaryCertification: complementaryCertification,
                  stillValidBadgeAcquisitions: [],
                }),
              ],
            });

            sessionForSupervisingRepository.get.resolves(retrievedSessionForSupervising);
            temporaryCompanionStorageService.getBySessionId.withArgs(1).resolves([]);

            const certificationBadgesService = {
              findStillValidBadgeAcquisitions: sinon.stub(),
            };
            certificationBadgesService.findStillValidBadgeAcquisitions
              .withArgs({ userId: 1234 })
              .resolves([stillValidBadgeAcquisition]);

            // when
            const actualSession = await getSessionForSupervising({
              sessionId: 1,
              sessionForSupervisingRepository,
              certificationBadgesService,
              temporaryCompanionStorageService,
            });

            // then
            expect(actualSession).to.deep.equal(
              domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    theoricalEndDateTime: expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [
                      DEFAULT_SESSION_DURATION_MINUTES,
                      COMPLEMENTARY_EXTRATIME_STUB,
                    ]),
                    enrolledComplementaryCertification: complementaryCertification,
                    stillValidBadgeAcquisitions: [stillValidBadgeAcquisition],
                  }),
                ],
              }),
            );
          });

          it('should get a theorical end datetime with extra time', async function () {
            const stillValidBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
              complementaryCertificationKey: 'aKey',
            });

            const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
              key: 'aKey',
              certificationExtraTime: COMPLEMENTARY_EXTRATIME_STUB,
            });

            sessionForSupervisingRepository.get.resolves(
              domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    enrolledComplementaryCertification: complementaryCertification,
                    stillValidBadgeAcquisitions: [],
                  }),
                ],
              }),
            );
            temporaryCompanionStorageService.getBySessionId.withArgs(1).resolves([]);

            const certificationBadgesService = { findStillValidBadgeAcquisitions: sinon.stub() };
            certificationBadgesService.findStillValidBadgeAcquisitions
              .withArgs({ userId: 1234 })
              .resolves([stillValidBadgeAcquisition]);

            // when
            const actualSession = await getSessionForSupervising({
              sessionId: 1,
              sessionForSupervisingRepository,
              certificationBadgesService,
              temporaryCompanionStorageService,
            });

            // then
            expect(actualSession.certificationCandidates).to.have.lengthOf(1);
            expect(actualSession.certificationCandidates[0].startDateTime).to.deep.equal(START_DATETIME_STUB);
            expect(actualSession.certificationCandidates[0].theoricalEndDateTime).to.deep.equal(
              expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [
                DEFAULT_SESSION_DURATION_MINUTES,
                COMPLEMENTARY_EXTRATIME_STUB,
              ]),
            );
          });
        });

        context('when some candidates are not eligible to complementary certifications', function () {
          it("should return the session with the candidates' non eligibility", async function () {
            // given
            const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising();
            const retrievedSessionForSupervising = domainBuilder.buildSessionForSupervising({
              certificationCandidates: [
                domainBuilder.buildCertificationCandidateForSupervising({
                  userId: 1234,
                  startDateTime: START_DATETIME_STUB,
                  enrolledComplementaryCertification: complementaryCertification,
                  stillValidBadgeAcquisitions: [],
                }),
              ],
            });

            sessionForSupervisingRepository.get.resolves(retrievedSessionForSupervising);
            temporaryCompanionStorageService.getBySessionId.withArgs(1).resolves([]);

            const certificationBadgesService = {
              findStillValidBadgeAcquisitions: sinon.stub(),
            };
            certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 1234 }).resolves([]);

            // when
            const actualSession = await getSessionForSupervising({
              sessionId: 1,
              sessionForSupervisingRepository,
              certificationBadgesService,
              temporaryCompanionStorageService,
            });

            // then
            expect(actualSession).to.deep.equal(
              domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    theoricalEndDateTime: expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [
                      DEFAULT_SESSION_DURATION_MINUTES,
                    ]),
                    enrolledComplementaryCertification: complementaryCertification,
                    stillValidBadgeAcquisitions: [],
                  }),
                ],
              }),
            );
          });

          it('should not get a theorical end datetime with extra time', async function () {
            // given
            const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
              key: 'aKey',
              label: 'une certif complémentaire',
              certificationExtraTime: COMPLEMENTARY_EXTRATIME_STUB,
            });

            sessionForSupervisingRepository.get.resolves(
              domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    enrolledComplementaryCertification: complementaryCertification,
                    stillValidBadgeAcquisitions: [],
                  }),
                ],
              }),
            );
            temporaryCompanionStorageService.getBySessionId.withArgs(1).resolves([]);

            const certificationBadgesService = { findStillValidBadgeAcquisitions: sinon.stub() };
            certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 1234 }).resolves([]);

            // when
            const actualSession = await getSessionForSupervising({
              sessionId: 1,
              sessionForSupervisingRepository,
              certificationBadgesService,
              temporaryCompanionStorageService,
            });

            // then
            expect(actualSession.certificationCandidates).to.have.lengthOf(1);
            expect(actualSession.certificationCandidates[0].startDateTime).to.deep.equal(START_DATETIME_STUB);
            expect(actualSession.certificationCandidates[0].theoricalEndDateTime).to.deep.equal(
              expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [DEFAULT_SESSION_DURATION_MINUTES]),
            );
          });
        });
      });
    });
  });
});
