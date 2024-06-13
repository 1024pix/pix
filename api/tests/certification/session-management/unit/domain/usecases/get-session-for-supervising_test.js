import dayjs from 'dayjs';

import { getSessionForSupervising } from '../../../../../../src/certification/session-management/domain/usecases/get-session-for-supervising.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../../src/certification/shared/domain/constants.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const START_DATETIME_STUB = new Date('2022-10-01T13:00:00Z');
const COMPLEMENTARY_EXTRATIME_STUB = 45;
const sessionForSupervisingRepository = { get: sinon.stub() };

const _expectedSessionEndDateTimeFromStartDateTime = (startDateTime, extraMinutes = []) => {
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
          sessionForSupervisingRepository.get.withArgs({ id: 1 }).resolves(session);

          // when
          const sessionForSupervising = await getSessionForSupervising({
            sessionId: 1,
            sessionForSupervisingRepository,
          });
          // then
          expect(sessionForSupervising.certificationCandidates).to.have.lengthOf(1);
          expect(sessionForSupervising.certificationCandidates[0].startDateTime).to.be.undefined;
          expect(sessionForSupervising.certificationCandidates[0].theoricalEndDateTime).to.be.undefined;
        });
      });

      context('when the candidate has no complementary certifications', function () {
        context('when the session has started', function () {
          it('should compute a theorical end datetime', async function () {
            // given
            const certificationCandidateWithNoComplementaryCertification =
              domainBuilder.buildCertificationCandidateForSupervising({
                complementaryCertification: undefined,
                complementaryCertificationKey: undefined,
                isComplementaryCertificationInProgress: false,
                startDateTime: START_DATETIME_STUB,
              });

            const session = domainBuilder.buildSessionForSupervising({
              certificationCandidates: [certificationCandidateWithNoComplementaryCertification],
            });
            sessionForSupervisingRepository.get.withArgs({ id: 1 }).resolves(session);

            // when
            const { certificationCandidates } = await getSessionForSupervising({
              sessionId: 1,
              sessionForSupervisingRepository,
            });

            // then
            const [{ startDateTime, theoricalEndDateTime }] = certificationCandidates;
            expect(startDateTime).to.deep.equal(START_DATETIME_STUB);
            expect(theoricalEndDateTime).to.deep.equal(
              _expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [DEFAULT_SESSION_DURATION_MINUTES]),
            );
          });
        });
      });

      context('when the candidate has complementary certifications', function () {
        context('when some candidates are still eligible to complementary certifications', function () {
          it("should return the session with the candidates' eligibility", async function () {
            // given
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
                  isComplementaryCertificationInProgress: true,
                }),
              ],
            });

            sessionForSupervisingRepository.get.withArgs({ id: 1 }).resolves(retrievedSessionForSupervising);

            // when
            const actualSession = await getSessionForSupervising({
              sessionId: 1,
              sessionForSupervisingRepository,
            });

            // then
            expect(actualSession).to.deep.equal(
              domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    theoricalEndDateTime: _expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [
                      DEFAULT_SESSION_DURATION_MINUTES,
                      COMPLEMENTARY_EXTRATIME_STUB,
                    ]),
                    enrolledComplementaryCertification: complementaryCertification,
                    isComplementaryCertificationInProgress: true,
                  }),
                ],
              }),
            );
          });

          it('should compute a theorical end datetime with extra time', async function () {
            const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
              key: 'aKey',
              certificationExtraTime: COMPLEMENTARY_EXTRATIME_STUB,
            });

            sessionForSupervisingRepository.get.withArgs({ id: 1 }).resolves(
              domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    enrolledComplementaryCertification: complementaryCertification,
                    isComplementaryCertificationInProgress: true,
                  }),
                ],
              }),
            );

            // when
            const { certificationCandidates } = await getSessionForSupervising({
              sessionId: 1,
              sessionForSupervisingRepository,
            });

            // then
            const [{ startDateTime, theoricalEndDateTime }] = certificationCandidates;
            expect(startDateTime).to.deep.equal(START_DATETIME_STUB);
            expect(theoricalEndDateTime).to.deep.equal(
              _expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [
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
                  isComplementaryCertificationInProgress: false,
                }),
              ],
            });

            sessionForSupervisingRepository.get.withArgs({ id: 1 }).resolves(retrievedSessionForSupervising);

            // when
            const actualSession = await getSessionForSupervising({
              sessionId: 1,
              sessionForSupervisingRepository,
            });

            // then
            expect(actualSession).to.deep.equal(
              domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    theoricalEndDateTime: _expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [
                      DEFAULT_SESSION_DURATION_MINUTES,
                    ]),
                    enrolledComplementaryCertification: complementaryCertification,
                    stillValidBadgeAcquisitions: [],
                  }),
                ],
              }),
            );
          });

          it('should not compute a theorical end datetime with extra time', async function () {
            // given
            const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
              key: 'aKey',
              label: 'une certif complémentaire',
              certificationExtraTime: COMPLEMENTARY_EXTRATIME_STUB,
            });

            sessionForSupervisingRepository.get.withArgs({ id: 1 }).resolves(
              domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    enrolledComplementaryCertification: complementaryCertification,
                    isComplementaryCertificationInProgress: false,
                  }),
                ],
              }),
            );

            // when
            const { certificationCandidates } = await getSessionForSupervising({
              sessionId: 1,
              sessionForSupervisingRepository,
            });

            // then
            const [{ startDateTime, theoricalEndDateTime }] = certificationCandidates;
            expect(startDateTime).to.deep.equal(START_DATETIME_STUB);
            expect(theoricalEndDateTime).to.deep.equal(
              _expectedSessionEndDateTimeFromStartDateTime(START_DATETIME_STUB, [DEFAULT_SESSION_DURATION_MINUTES]),
            );
          });
        });
      });
    });
  });
});
