import { getSessionForSupervising } from '../../../../../../src/certification/session-management/domain/usecases/get-session-for-supervising.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../../src/certification/shared/domain/constants.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const START_DATETIME_STUB = new Date('2022-10-01T13:00:00Z');
const sessionForSupervisingRepository = { get: sinon.stub() };

describe('Unit | UseCase | get-session-for-supervising', function () {
  context('when the session exists', function () {
    context('when there are candidates', function () {
      context('when the session has not started yet', function () {
        it('should not compute duration for candidates without startDateTime', async function () {
          // given
          const certificationCandidateNotStarted = domainBuilder.buildCertificationCandidateForSupervising();
          delete certificationCandidateNotStarted.startDateTime;

          const session = domainBuilder.buildSessionForSupervising({
            certificationCandidates: [certificationCandidateNotStarted],
          });
          sessionForSupervisingRepository.get.resolves(session);

          // when
          const sessionForSupervising = await getSessionForSupervising({
            sessionId: 1,
            sessionForSupervisingRepository,
          });

          // then
          expect(sessionForSupervising.certificationCandidates).to.have.lengthOf(1);
          expect(sessionForSupervising.certificationCandidates[0].startDateTime).to.be.undefined;
        });
      });

      context('when the session has started', function () {
        context('when candidates are registered to a core certification', function () {
          it('should get certification candidates with duration', async function () {
            // given
            const sessionId = 1;
            const certificationCandidateId = 51;
            const certificationCandidateWithNoComplementaryCertification =
              domainBuilder.buildCertificationCandidateForSupervising({
                id: certificationCandidateId,
                enrolledComplementaryCertification: undefined,
              });

            const session = domainBuilder.buildSessionForSupervising({
              sessionId,
              certificationCandidates: [certificationCandidateWithNoComplementaryCertification],
            });
            sessionForSupervisingRepository.get.resolves(session);

            // when
            const { certificationCandidates } = await getSessionForSupervising({
              sessionId,
              sessionForSupervisingRepository,
            });
            // then
            const [certificationCandidate] = certificationCandidates;
            expect(certificationCandidate).to.have.deep.property(
              'startDateTime',
              certificationCandidateWithNoComplementaryCertification.startDateTime,
            );
            expect(certificationCandidate).to.have.deep.property('duration', DEFAULT_SESSION_DURATION_MINUTES);
          });
        });

        context('when candidates are registered to a complementary certification', function () {
          it('should get certification candidates with duration', async function () {
            // given
            const sessionId = 1;
            const certificationCandidateId = 51;
            const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising();
            const certificationCandidateWithComplementaryCertification =
              domainBuilder.buildCertificationCandidateForSupervising({
                id: certificationCandidateId,
                enrolledComplementaryCertification: complementaryCertification,
              });

            const session = domainBuilder.buildSessionForSupervising({
              sessionId,
              certificationCandidates: [certificationCandidateWithComplementaryCertification],
            });
            sessionForSupervisingRepository.get.resolves(session);

            // when
            const { certificationCandidates } = await getSessionForSupervising({
              sessionId,
              sessionForSupervisingRepository,
            });
            // then
            const [certificationCandidate] = certificationCandidates;
            expect(certificationCandidate).to.have.deep.property(
              'startDateTime',
              certificationCandidateWithComplementaryCertification.startDateTime,
            );
            expect(certificationCandidate).to.have.deep.property('duration', complementaryCertification.duration);
          });
        });

        context('when candidates are registered to a double certification', function () {
          context('when some candidates are still eligible', function () {
            it("returns the session with the candidates' eligibility", async function () {
              // given
              const stillValidBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
                complementaryCertificationKey: 'aKey',
                complementaryCertificationBadgeLabel: 'une certif complémentaire',
              });

              const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
                key: 'aKey',
                label: 'une certif complémentaire',
              });

              const retrievedSessionForSupervising = domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    enrolledComplementaryCertification: null,
                    enrolledDoubleCertification: complementaryCertification,
                    stillValidBadgeAcquisitions: [],
                  }),
                ],
              });

              sessionForSupervisingRepository.get.resolves(retrievedSessionForSupervising);

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
              });

              // then
              expect(actualSession).to.deep.equal(
                domainBuilder.buildSessionForSupervising({
                  certificationCandidates: [
                    domainBuilder.buildCertificationCandidateForSupervising({
                      userId: 1234,
                      startDateTime: START_DATETIME_STUB,
                      duration: DEFAULT_SESSION_DURATION_MINUTES,
                      enrolledDoubleCertification: complementaryCertification,
                      enrolledComplementaryCertification: null,
                      stillValidBadgeAcquisitions: [stillValidBadgeAcquisition],
                    }),
                  ],
                }),
              );
            });

            it('gets duration', async function () {
              const stillValidBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
                complementaryCertificationKey: 'aKey',
              });

              const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
                key: 'aKey',
              });

              const certificationBadgesService = { findStillValidBadgeAcquisitions: sinon.stub() };
              certificationBadgesService.findStillValidBadgeAcquisitions
                .withArgs({ userId: 1234 })
                .resolves([stillValidBadgeAcquisition]);

              sessionForSupervisingRepository.get.resolves(
                domainBuilder.buildSessionForSupervising({
                  certificationCandidates: [
                    domainBuilder.buildCertificationCandidateForSupervising({
                      userId: 1234,
                      startDateTime: START_DATETIME_STUB,
                      enrolledComplementaryCertification: null,
                      enrolledDoubleCertification: complementaryCertification,
                      stillValidBadgeAcquisitions: [stillValidBadgeAcquisition],
                    }),
                  ],
                }),
              );

              // when
              const actualSession = await getSessionForSupervising({
                sessionId: 1,
                sessionForSupervisingRepository,
                certificationBadgesService,
              });

              // then
              expect(actualSession.certificationCandidates).to.have.lengthOf(1);
              expect(actualSession.certificationCandidates[0].startDateTime).to.deep.equal(START_DATETIME_STUB);
              expect(actualSession.certificationCandidates[0]).to.have.deep.property(
                'duration',
                DEFAULT_SESSION_DURATION_MINUTES,
              );
            });
          });

          context('when some candidates are not eligible to a double certification', function () {
            it("returns the session with the candidates' non eligibility", async function () {
              // given
              const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising();
              const retrievedSessionForSupervising = domainBuilder.buildSessionForSupervising({
                certificationCandidates: [
                  domainBuilder.buildCertificationCandidateForSupervising({
                    userId: 1234,
                    startDateTime: START_DATETIME_STUB,
                    enrolledComplementaryCertification: null,
                    enrolledDoubleCertification: complementaryCertification,
                    stillValidBadgeAcquisitions: [],
                  }),
                ],
              });

              sessionForSupervisingRepository.get.resolves(retrievedSessionForSupervising);

              const certificationBadgesService = {
                findStillValidBadgeAcquisitions: sinon.stub(),
              };
              certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 1234 }).resolves([]);

              // when
              const actualSession = await getSessionForSupervising({
                sessionId: 1,
                sessionForSupervisingRepository,
                certificationBadgesService,
              });

              // then
              expect(actualSession).to.deep.equal(
                domainBuilder.buildSessionForSupervising({
                  certificationCandidates: [
                    domainBuilder.buildCertificationCandidateForSupervising({
                      userId: 1234,
                      startDateTime: START_DATETIME_STUB,
                      duration: DEFAULT_SESSION_DURATION_MINUTES,
                      enrolledComplementaryCertification: null,
                      enrolledDoubleCertification: complementaryCertification,
                      stillValidBadgeAcquisitions: [],
                    }),
                  ],
                }),
              );
            });

            it('gets duration without extra time', async function () {
              // given
              const complementaryCertification = domainBuilder.buildComplementaryCertificationForSupervising({
                key: 'aKey',
                label: 'une certif complémentaire',
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

              const certificationBadgesService = { findStillValidBadgeAcquisitions: sinon.stub() };
              certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 1234 }).resolves([]);

              // when
              const actualSession = await getSessionForSupervising({
                sessionId: 1,
                sessionForSupervisingRepository,
                certificationBadgesService,
              });

              // then
              expect(actualSession.certificationCandidates).to.have.lengthOf(1);
              expect(actualSession.certificationCandidates[0].startDateTime).to.deep.equal(START_DATETIME_STUB);
            });
          });
        });
      });
    });
  });
});
