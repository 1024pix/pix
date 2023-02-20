import { catchErr, expect, sinon, domainBuilder } from '../../../test-helper';
import { linkUserToSessionCertificationCandidate } from '../../../../lib/domain/usecases/link-user-to-session-certification-candidate';

import {
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  MatchingReconciledStudentNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  UserAlreadyLinkedToCandidateInSessionError,
  SessionNotAccessible,
} from '../../../../lib/domain/errors';

import UserLinkedToCertificationCandidate from '../../../../lib/domain/events/UserLinkedToCertificationCandidate';
import UserAlreadyLinkedToCertificationCandidate from '../../../../lib/domain/events/UserAlreadyLinkedToCertificationCandidate';

describe('Unit | Domain | Use Cases | link-user-to-session-certification-candidate', function () {
  const sessionId = 42;
  const userId = 'userId';
  const firstName = 'Charlie';
  const lastName = 'Bideau';
  const birthdate = '2010-10-10';

  context('when the session is not accessible', function () {
    it('should throw a SessionNotAccessible error', async function () {
      // given
      const sessionRepository = {
        get: sinon.stub(),
      };
      sessionRepository.get.withArgs(42).resolves(domainBuilder.buildSession.finalized());

      // when
      const err = await catchErr(linkUserToSessionCertificationCandidate)({
        sessionId,
        userId,
        firstName,
        lastName,
        birthdate,
        sessionRepository,
      });

      // then
      expect(err).to.be.instanceOf(SessionNotAccessible);
    });
  });

  context('when the session is accessible', function () {
    const sessionRepository = { get: () => undefined };

    beforeEach(function () {
      sessionRepository.get = sinon.stub();
      sessionRepository.get.withArgs(42).resolves(domainBuilder.buildSession.created());
    });

    context('when there is a problem with the personal info', function () {
      context('when no certification candidates match with the provided personal info', function () {
        it('should throw a CertificationCandidateByPersonalInfoNotFoundError', async function () {
          // given
          const certificationCandidateRepository =
            _buildFakeCertificationCandidateRepository().withFindBySessionIdAndPersonalInfo({
              args: {
                sessionId,
                firstName,
                lastName,
                birthdate,
              },
              resolves: [],
            });

          // when
          const err = await catchErr(linkUserToSessionCertificationCandidate)({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            sessionRepository,
            certificationCandidateRepository,
          });

          // then
          expect(err).to.be.instanceOf(CertificationCandidateByPersonalInfoNotFoundError);
        });
      });

      context(
        'when there are more than one certification candidates that match with the provided personal info',
        function () {
          it('should throw a CertificationCandidateByPersonalInfoTooManyMatchesError', async function () {
            // given
            const certificationCandidateRepository =
              _buildFakeCertificationCandidateRepository().withFindBySessionIdAndPersonalInfo({
                args: {
                  sessionId,
                  firstName,
                  lastName,
                  birthdate,
                },
                resolves: ['candidate1', 'candidate2'],
              });

            // when
            const err = await catchErr(linkUserToSessionCertificationCandidate)({
              sessionId,
              userId,
              firstName,
              lastName,
              birthdate,
              sessionRepository,
              certificationCandidateRepository,
            });

            // then
            expect(err).to.be.instanceOf(CertificationCandidateByPersonalInfoTooManyMatchesError);
          });
        }
      );
    });

    context(
      'when there is exactly one certification candidate that matches with the provided personal info',
      function () {
        context('when the matching certification candidate is already linked to a user', function () {
          context('when the linked user is the same as the user being linked', function () {
            it('should not create a link and return the matching certification candidate', async function () {
              // given
              const certificationCandidate = domainBuilder.buildCertificationCandidate({ userId });
              const certificationCandidateRepository =
                _buildFakeCertificationCandidateRepository().withFindBySessionIdAndPersonalInfo({
                  args: {
                    sessionId,
                    firstName,
                    lastName,
                    birthdate,
                  },
                  resolves: [certificationCandidate],
                });

              const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SUP' });
              const certificationCenterRepository = _buildFakeCertificationCenterRepository().withGetBySessionId({
                args: sessionId,
                resolves: certificationCenter,
              });

              // when
              const result = await linkUserToSessionCertificationCandidate({
                sessionId,
                userId,
                firstName,
                lastName,
                birthdate,
                sessionRepository,
                certificationCandidateRepository,
                certificationCenterRepository,
              });

              // then
              expect(result).to.deep.equal(new UserAlreadyLinkedToCertificationCandidate());
            });
          });

          context('when the linked user is not the same as the user being linked', function () {
            it('should throw a CertificationCandidateAlreadyLinkedToUserError', async function () {
              // given
              const certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: 'otherUserId' });
              const certificationCandidateRepository =
                _buildFakeCertificationCandidateRepository().withFindBySessionIdAndPersonalInfo({
                  args: {
                    sessionId,
                    firstName,
                    lastName,
                    birthdate,
                  },
                  resolves: [certificationCandidate],
                });

              const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SUP' });
              const certificationCenterRepository = _buildFakeCertificationCenterRepository().withGetBySessionId({
                args: sessionId,
                resolves: certificationCenter,
              });

              // when
              const err = await catchErr(linkUserToSessionCertificationCandidate)({
                sessionId,
                userId,
                firstName,
                lastName,
                birthdate,
                sessionRepository,
                certificationCandidateRepository,
                certificationCenterRepository,
              });

              // then
              expect(err).to.be.instanceOf(CertificationCandidateAlreadyLinkedToUserError);
            });
          });
        });

        context('when the matching certification candidate has no link to any user', function () {
          context('when the user is already linked to another candidate in the session', function () {
            it('should throw a UserAlreadyLinkedToCandidateInSessionError', async function () {
              // given
              const certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: null });
              const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
                .withFindBySessionIdAndPersonalInfo({
                  args: {
                    sessionId,
                    firstName,
                    lastName,
                    birthdate,
                  },
                  resolves: [certificationCandidate],
                })
                .withFindOneBySessionIdAndUserId({
                  args: { sessionId, userId },
                  resolves: 'existingLinkedCandidateToUser',
                });

              const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SUP' });
              const certificationCenterRepository = _buildFakeCertificationCenterRepository().withGetBySessionId({
                args: sessionId,
                resolves: certificationCenter,
              });

              // when
              const err = await catchErr(linkUserToSessionCertificationCandidate)({
                sessionId,
                userId,
                firstName,
                lastName,
                birthdate,
                sessionRepository,
                certificationCandidateRepository,
                certificationCenterRepository,
              });

              // then
              expect(err).to.be.instanceOf(UserAlreadyLinkedToCandidateInSessionError);
            });
          });

          context('when the user is not linked to any candidate in this session', function () {
            it('should create a link between the candidate and the user and return the linked certification candidate', async function () {
              // given
              const certificationCandidate = domainBuilder.buildCertificationCandidate({
                userId: null,
                id: 'candidateId',
              });
              const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
                .withFindBySessionIdAndPersonalInfo({
                  args: {
                    sessionId,
                    firstName,
                    lastName,
                    birthdate,
                  },
                  resolves: [certificationCandidate],
                })
                .withFindOneBySessionIdAndUserId({ args: { sessionId, userId }, resolves: undefined })
                .withLinkToUser({});

              const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SUP' });
              const certificationCenterRepository = _buildFakeCertificationCenterRepository().withGetBySessionId({
                args: sessionId,
                resolves: certificationCenter,
              });

              // when
              const result = await linkUserToSessionCertificationCandidate({
                sessionId,
                userId,
                firstName,
                lastName,
                birthdate,
                sessionRepository,
                certificationCandidateRepository,
                certificationCenterRepository,
              });

              // then
              expect(result).to.deep.equal(new UserAlreadyLinkedToCertificationCandidate());
              sinon.assert.calledWith(certificationCandidateRepository.linkToUser, {
                id: certificationCandidate.id,
                userId,
              });
            });
          });
        });
      }
    );

    context('when the organization behind this session is of type SCO', function () {
      context('when the organization is also managing students', function () {
        context('when the user does not match with a session candidate and its organization learner', function () {
          it('throws MatchingReconciledStudentNotFoundError', async function () {
            // given
            const certificationCandidate = domainBuilder.buildCertificationCandidate({
              userId: null,
              firstName,
              lastName,
              birthdate,
            });
            const certificationCandidateRepository =
              _buildFakeCertificationCandidateRepository().withFindBySessionIdAndPersonalInfo({
                args: {
                  sessionId,
                  firstName,
                  lastName,
                  birthdate,
                },
                resolves: [certificationCandidate],
              });

            const certificationCenter = domainBuilder.buildCertificationCenter({
              sessionId,
              type: 'SCO',
              externalId: '123456',
            });
            const certificationCenterRepository = _buildFakeCertificationCenterRepository().withGetBySessionId({
              args: sessionId,
              resolves: certificationCenter,
            });
            const organization = domainBuilder.buildOrganization({
              type: 'SCO',
              isManagingStudents: true,
              externalId: '123456',
            });
            const organizationRepository = _buildFakeOrganizationRepository().withGetScoOrganizationByExternalId({
              args: '123456',
              resolves: organization,
            });

            const organizationLearnerRepository =
              _buildFakeOrganizationLearnerRepository().withIsOrganizationLearnerIdLinkedToUserAndSCOOrganization({
                args: { userId, organizationLearnerId: certificationCandidate.organizationLearnerId },
                resolves: false,
              });

            // when
            const err = await catchErr(linkUserToSessionCertificationCandidate)({
              sessionId,
              userId,
              firstName,
              lastName,
              birthdate,
              sessionRepository,
              certificationCandidateRepository,
              organizationLearnerRepository,
              certificationCenterRepository,
              organizationRepository,
            });

            // then
            expect(err).to.be.instanceOf(MatchingReconciledStudentNotFoundError);
          });
        });

        context('when the user matches with a session candidate and its organization learner', function () {
          context('when no other candidates is already linked to that user', function () {
            it('should create a link between the candidate and the user and return an event to notify it, ', async function () {
              // given
              const organizationLearner = domainBuilder.buildOrganizationLearner();
              const certificationCandidate = domainBuilder.buildCertificationCandidate({
                userId: null,
                firstName,
                lastName,
                birthdate,
                organizationLearnerId: organizationLearner.id,
              });
              const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
                .withFindBySessionIdAndPersonalInfo({
                  args: {
                    sessionId,
                    firstName,
                    lastName,
                    birthdate,
                  },
                  resolves: [certificationCandidate],
                })
                .withFindOneBySessionIdAndUserId({
                  args: {
                    sessionId,
                    userId,
                  },
                  resolves: null,
                });

              const certificationCenter = domainBuilder.buildCertificationCenter({
                sessionId,
                type: 'SCO',
                externalId: '123456',
              });
              const certificationCenterRepository = _buildFakeCertificationCenterRepository().withGetBySessionId({
                args: sessionId,
                resolves: certificationCenter,
              });
              const organization = domainBuilder.buildOrganization({
                type: 'SCO',
                isManagingStudents: true,
                externalId: '123456',
              });
              const organizationRepository = _buildFakeOrganizationRepository().withGetScoOrganizationByExternalId({
                args: '123456',
                resolves: organization,
              });

              const organizationLearnerRepository =
                _buildFakeOrganizationLearnerRepository().withIsOrganizationLearnerIdLinkedToUserAndSCOOrganization({
                  args: { userId, organizationLearnerId: certificationCandidate.organizationLearnerId },
                  resolves: true,
                });

              // when
              const event = await linkUserToSessionCertificationCandidate({
                sessionId,
                userId,
                firstName,
                lastName,
                birthdate,
                sessionRepository,
                certificationCandidateRepository,
                organizationLearnerRepository,
                certificationCenterRepository,
                organizationRepository,
              });

              // then
              expect(certificationCandidateRepository.linkToUser).to.have.been.calledWith({
                id: certificationCandidate.id,
                userId,
              });
              expect(
                organizationLearnerRepository.isOrganizationLearnerIdLinkedToUserAndSCOOrganization
              ).to.have.been.calledWith({ userId, organizationLearnerId: organizationLearner.id });
              expect(event).to.be.instanceOf(UserLinkedToCertificationCandidate);
            });
          });

          context('when another candidates is already linked to that user', function () {
            it('throws UserAlreadyLinkedToCandidateInSessionError', async function () {
              // given
              const organizationLearner = domainBuilder.buildOrganizationLearner();
              const certificationCandidate = domainBuilder.buildCertificationCandidate({
                userId: null,
                firstName,
                lastName,
                birthdate,
                organizationLearnerId: organizationLearner.id,
              });
              const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
                .withFindBySessionIdAndPersonalInfo({
                  args: {
                    sessionId,
                    firstName,
                    lastName,
                    birthdate,
                  },
                  resolves: [certificationCandidate],
                })
                .withFindOneBySessionIdAndUserId({
                  args: {
                    sessionId,
                    userId,
                  },
                  resolves: domainBuilder.buildCertificationCandidate({ id: 'another candidate' }),
                });

              const certificationCenter = domainBuilder.buildCertificationCenter({
                sessionId,
                type: 'SCO',
                externalId: '123456',
              });
              const certificationCenterRepository = _buildFakeCertificationCenterRepository().withGetBySessionId({
                args: sessionId,
                resolves: certificationCenter,
              });
              const organization = domainBuilder.buildOrganization({
                type: 'SCO',
                isManagingStudents: true,
                externalId: '123456',
              });
              const organizationRepository = _buildFakeOrganizationRepository().withGetScoOrganizationByExternalId({
                args: '123456',
                resolves: organization,
              });

              const organizationLearnerRepository =
                _buildFakeOrganizationLearnerRepository().withIsOrganizationLearnerIdLinkedToUserAndSCOOrganization({
                  args: { userId, organizationLearnerId: certificationCandidate.organizationLearnerId },
                  resolves: true,
                });

              // when
              const error = await catchErr(linkUserToSessionCertificationCandidate)({
                sessionId,
                userId,
                firstName,
                lastName,
                birthdate,
                sessionRepository,
                certificationCandidateRepository,
                organizationLearnerRepository,
                certificationCenterRepository,
                organizationRepository,
              });

              // then
              expect(
                organizationLearnerRepository.isOrganizationLearnerIdLinkedToUserAndSCOOrganization
              ).to.have.been.calledWith({ userId, organizationLearnerId: organizationLearner.id });
              expect(error).to.be.an.instanceof(UserAlreadyLinkedToCandidateInSessionError);
            });
          });
        });
      });

      context('when the organization is not managing students', function () {
        it('should return the linked certification candidate', async function () {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: null, id: 'candidateId' });
          const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
            .withFindBySessionIdAndPersonalInfo({
              args: {
                sessionId,
                firstName,
                lastName,
                birthdate,
              },
              resolves: [certificationCandidate],
            })
            .withFindOneBySessionIdAndUserId({ args: { sessionId, userId }, resolves: undefined })
            .withLinkToUser({});

          const certificationCenter = domainBuilder.buildCertificationCenter({
            sessionId,
            type: 'SCO',
            externalId: '123456',
          });
          const certificationCenterRepository = _buildFakeCertificationCenterRepository().withGetBySessionId({
            args: sessionId,
            resolves: certificationCenter,
          });
          const organization = domainBuilder.buildOrganization({
            type: 'SCO',
            isManagingStudents: false,
            externalId: '123456',
          });
          const organizationRepository = _buildFakeOrganizationRepository().withGetScoOrganizationByExternalId({
            args: '123456',
            resolves: organization,
          });

          const organizationLearnerRepository =
            _buildFakeOrganizationLearnerRepository().withIsOrganizationLearnerIdLinkedToUserAndSCOOrganization({
              args: { userId, organizationLearnerId: certificationCandidate.organizationLearnerId },
              resolves: true,
            });

          // when
          const result = await linkUserToSessionCertificationCandidate({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            sessionRepository,
            certificationCandidateRepository,
            certificationCenterRepository,
            organizationRepository,
            organizationLearnerRepository,
          });

          // then
          expect(organizationLearnerRepository.isOrganizationLearnerIdLinkedToUserAndSCOOrganization).to.be.not.called;
          expect(result).to.be.an.instanceof(UserLinkedToCertificationCandidate);
        });
      });
    });
  });
});

function _buildFakeCertificationCenterRepository() {
  const getBySessionId = sinon.stub();
  return {
    getBySessionId,
    withGetBySessionId({ args, resolves }) {
      this.getBySessionId.withArgs(args).resolves(resolves);
      return this;
    },
  };
}

function _buildFakeOrganizationRepository() {
  const getScoOrganizationByExternalId = sinon.stub();
  return {
    getScoOrganizationByExternalId,
    withGetScoOrganizationByExternalId({ args, resolves }) {
      this.getScoOrganizationByExternalId.withArgs(args).resolves(resolves);
      return this;
    },
  };
}

function _buildFakeOrganizationLearnerRepository() {
  const isOrganizationLearnerIdLinkedToUserAndSCOOrganization = sinon.stub();
  return {
    isOrganizationLearnerIdLinkedToUserAndSCOOrganization,
    withIsOrganizationLearnerIdLinkedToUserAndSCOOrganization({ args, resolves }) {
      this.isOrganizationLearnerIdLinkedToUserAndSCOOrganization.withArgs(args).resolves(resolves);
      return this;
    },
  };
}

function _buildFakeCertificationCandidateRepository() {
  const findBySessionIdAndPersonalInfo = sinon.stub();
  const findOneBySessionIdAndUserId = sinon.stub();
  const linkToUser = sinon.stub();
  return {
    findBySessionIdAndPersonalInfo,
    findOneBySessionIdAndUserId,
    linkToUser,
    withFindBySessionIdAndPersonalInfo({ args, resolves }) {
      this.findBySessionIdAndPersonalInfo.withArgs(args).resolves(resolves);
      return this;
    },
    withFindOneBySessionIdAndUserId({ args, resolves }) {
      this.findOneBySessionIdAndUserId.withArgs(args).resolves(resolves);
      return this;
    },
    withLinkToUser({ args, resolves }) {
      this.linkToUser.withArgs(args).resolves(resolves);
      return this;
    },
  };
}
