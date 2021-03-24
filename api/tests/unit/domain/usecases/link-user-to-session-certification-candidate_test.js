const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { linkUserToSessionCertificationCandidate } = require('../../../../lib/domain/usecases/link-user-to-session-certification-candidate');
const {
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  MatchingReconciledStudentNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  UserAlreadyLinkedToCandidateInSessionError,
} = require('../../../../lib/domain/errors');
const UserLinkedToCertificationCandidate = require('../../../../lib/domain/events/UserLinkedToCertificationCandidate');
const UserAlreadyLinkedToCertificationCandidate = require('../../../../lib/domain/events/UserAlreadyLinkedToCertificationCandidate');

describe('Unit | Domain | Use Cases | link-user-to-session-certification-candidate', () => {
  const sessionId = 42;
  const userId = 'userId';
  const firstName = 'Charlie';
  const lastName = 'Bideau';
  const birthdate = '2010-10-10';

  context('when there is a problem with the personal info', () => {

    context('when no certification candidates match with the provided personal info', () => {

      it('should throw a CertificationCandidateByPersonalInfoNotFoundError', async () => {
        // given
        const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
          .withFindBySessionIdAndPersonalInfo({
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
          certificationCandidateRepository,
        });

        // then
        expect(err).to.be.instanceOf(CertificationCandidateByPersonalInfoNotFoundError);
      });
    });

    context('when there are more than one certification candidates that match with the provided personal info', () => {

      it('should throw a CertificationCandidateByPersonalInfoTooManyMatchesError', async () => {
        // given
        const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
          .withFindBySessionIdAndPersonalInfo({
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
          certificationCandidateRepository,
        });

        // then
        expect(err).to.be.instanceOf(CertificationCandidateByPersonalInfoTooManyMatchesError);
      });
    });
  });

  context('when there is exactly one certification candidate that matches with the provided personal info', () => {

    context('when the matching certification candidate is already linked to a user', () => {

      context('when the linked user is the same as the user being linked', () => {

        it('should not create a link and return the matching certification candidate', async () => {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({ userId });
          const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
            .withFindBySessionIdAndPersonalInfo({
              args: {
                sessionId,
                firstName,
                lastName,
                birthdate,
              },
              resolves: [certificationCandidate],
            });

          const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SUP' });
          const certificationCenterRepository = _buildFakeCertificationCenterRepository()
            .withGetBySessionId({ args: sessionId, resolves: certificationCenter });

          // when
          const result = await linkUserToSessionCertificationCandidate({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
            certificationCenterRepository,
          });

          // then
          expect(result).to.deep.equal(
            new UserAlreadyLinkedToCertificationCandidate(),
          );
        });
      });

      context('when the linked user is the not the same as the user being linked', () => {

        it('should throw a CertificationCandidateAlreadyLinkedToUserError', async () => {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: 'otherUserId' });
          const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
            .withFindBySessionIdAndPersonalInfo({
              args: {
                sessionId,
                firstName,
                lastName,
                birthdate,
              },
              resolves: [certificationCandidate],
            });

          const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SUP' });
          const certificationCenterRepository = _buildFakeCertificationCenterRepository()
            .withGetBySessionId({ args: sessionId, resolves: certificationCenter });

          // when
          const err = await catchErr(linkUserToSessionCertificationCandidate)({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
            certificationCenterRepository,
          });

          // then
          expect(err).to.be.instanceOf(CertificationCandidateAlreadyLinkedToUserError);
        });
      });
    });

    context('when the matching certification candidate has no link to any user', () => {

      context('when the user is already linked to another candidate in the session', () => {

        it('should throw a UserAlreadyLinkedToCandidateInSessionError', async () => {
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
            .withFindOneBySessionIdAndUserId({ args: { sessionId, userId }, resolves: 'existingLinkedCandidateToUser' });

          const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SUP' });
          const certificationCenterRepository = _buildFakeCertificationCenterRepository()
            .withGetBySessionId({ args: sessionId, resolves: certificationCenter });

          // when
          const err = await catchErr(linkUserToSessionCertificationCandidate)({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
            certificationCenterRepository,
          });

          // then
          expect(err).to.be.instanceOf(UserAlreadyLinkedToCandidateInSessionError);
        });
      });

      context('when the user is not linked to any candidate in this session', () => {

        it('should create a link with between the candidate and the user and return the linked certification candidate', async () => {
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

          const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SUP' });
          const certificationCenterRepository = _buildFakeCertificationCenterRepository()
            .withGetBySessionId({ args: sessionId, resolves: certificationCenter });

          // when
          const result = await linkUserToSessionCertificationCandidate({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
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
  });

  context('when the organization behind this session is of type SCO', () => {

    context('when the organization is also managing students', () => {

      context('when the user does not match with a session candidate and its schooling registration', () => {

        it('throws MatchingReconciledStudentNotFoundError', async () => {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({
            userId: null,
            firstName, lastName, birthdate,
          });
          const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
            .withFindBySessionIdAndPersonalInfo({
              args: {
                sessionId,
                firstName,
                lastName,
                birthdate,
              },
              resolves: [certificationCandidate] });

          const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SCO', externalId: '123456' });
          const certificationCenterRepository = _buildFakeCertificationCenterRepository()
            .withGetBySessionId({ args: sessionId, resolves: certificationCenter });
          const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: true, externalId: '123456' });
          const organizationRepository = _buildFakeOrganizationRepository()
            .withGetScoOrganizationByExternalId({ args: '123456', resolves: organization });

          const schoolingRegistrationRepository = _buildFakeSchoolingRegistrationRepository()
            .withIsSchoolingRegistrationIdLinkedToUserAndSCOOrganization({
              args: { userId, schoolingRegistrationId: certificationCandidate.schoolingRegistrationId },
              resolves: false,
            });

          // when
          const err = await catchErr(linkUserToSessionCertificationCandidate)({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
            schoolingRegistrationRepository,
            certificationCenterRepository,
            organizationRepository,
          });

          // then
          expect(err).to.be.instanceOf(MatchingReconciledStudentNotFoundError);
        });
      });

      context('when the user matches with a session candidate and its schooling registration', () => {

        context('when no other candidates is already linked to that user', () => {

          it('should create a link between the candidate and the user and return an event to notify it, ', async () => {
            // given
            const schoolingRegistration = domainBuilder.buildSchoolingRegistration();
            const certificationCandidate = domainBuilder.buildCertificationCandidate({
              userId: null,
              firstName, lastName, birthdate,
              schoolingRegistrationId: schoolingRegistration.id,
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

            const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SCO', externalId: '123456' });
            const certificationCenterRepository = _buildFakeCertificationCenterRepository()
              .withGetBySessionId({ args: sessionId, resolves: certificationCenter });
            const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: true, externalId: '123456' });
            const organizationRepository = _buildFakeOrganizationRepository()
              .withGetScoOrganizationByExternalId({ args: '123456', resolves: organization });

            const schoolingRegistrationRepository = _buildFakeSchoolingRegistrationRepository()
              .withIsSchoolingRegistrationIdLinkedToUserAndSCOOrganization({ args: { userId, schoolingRegistrationId: certificationCandidate.schoolingRegistrationId }, resolves: true });

            // when
            const event = await linkUserToSessionCertificationCandidate({
              sessionId,
              userId,
              firstName,
              lastName,
              birthdate,
              certificationCandidateRepository,
              schoolingRegistrationRepository,
              certificationCenterRepository,
              organizationRepository,
            });

            // then
            expect(certificationCandidateRepository.linkToUser).to.have.been.calledWith({
              id: certificationCandidate.id,
              userId,
            });
            expect(schoolingRegistrationRepository.isSchoolingRegistrationIdLinkedToUserAndSCOOrganization)
              .to.have.been.calledWith({ userId, schoolingRegistrationId: schoolingRegistration.id });
            expect(event).to.be.instanceOf(UserLinkedToCertificationCandidate);
          });
        });

        context('when another candidates is already linked to that user', () => {

          it('throws UserAlreadyLinkedToCandidateInSessionError', async () => {
            // given
            const schoolingRegistration = domainBuilder.buildSchoolingRegistration();
            const certificationCandidate = domainBuilder.buildCertificationCandidate({
              userId: null,
              firstName, lastName, birthdate,
              schoolingRegistrationId: schoolingRegistration.id,
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
              .withFindOneBySessionIdAndUserId({ args: {
                sessionId,
                userId,
              }, resolves: domainBuilder.buildCertificationCandidate({ id: 'another candidate' }) });

            const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SCO', externalId: '123456' });
            const certificationCenterRepository = _buildFakeCertificationCenterRepository()
              .withGetBySessionId({ args: sessionId, resolves: certificationCenter });
            const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: true, externalId: '123456' });
            const organizationRepository = _buildFakeOrganizationRepository()
              .withGetScoOrganizationByExternalId({ args: '123456', resolves: organization });

            const schoolingRegistrationRepository = _buildFakeSchoolingRegistrationRepository()
              .withIsSchoolingRegistrationIdLinkedToUserAndSCOOrganization({ args: { userId, schoolingRegistrationId: certificationCandidate.schoolingRegistrationId }, resolves: true });

            // when
            const error = await catchErr(linkUserToSessionCertificationCandidate)({
              sessionId,
              userId,
              firstName,
              lastName,
              birthdate,
              certificationCandidateRepository,
              schoolingRegistrationRepository,
              certificationCenterRepository,
              organizationRepository,
            });

            // then
            expect(schoolingRegistrationRepository.isSchoolingRegistrationIdLinkedToUserAndSCOOrganization)
              .to.have.been.calledWith({ userId, schoolingRegistrationId: schoolingRegistration.id });
            expect(error).to.be.an.instanceof(UserAlreadyLinkedToCandidateInSessionError);
          });
        });
      });
    });

    context('when the organization is not managing students', () => {

      it('should return the linked certification candidate', async () => {
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

        const certificationCenter = domainBuilder.buildCertificationCenter({ sessionId, type: 'SCO', externalId: '123456' });
        const certificationCenterRepository = _buildFakeCertificationCenterRepository()
          .withGetBySessionId({ args: sessionId, resolves: certificationCenter });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: false, externalId: '123456' });
        const organizationRepository = _buildFakeOrganizationRepository()
          .withGetScoOrganizationByExternalId({ args: '123456', resolves: organization });

        const schoolingRegistrationRepository = _buildFakeSchoolingRegistrationRepository()
          .withIsSchoolingRegistrationIdLinkedToUserAndSCOOrganization({
            args: { userId, schoolingRegistrationId: certificationCandidate.schoolingRegistrationId },
            resolves: true,
          });

        // when
        const result = await linkUserToSessionCertificationCandidate({
          sessionId,
          userId,
          firstName,
          lastName,
          birthdate,
          certificationCandidateRepository,
          certificationCenterRepository,
          organizationRepository,
          schoolingRegistrationRepository,
        });

        // then
        expect(schoolingRegistrationRepository.isSchoolingRegistrationIdLinkedToUserAndSCOOrganization).to.be.not.called;
        expect(result).to.be.an.instanceof(UserLinkedToCertificationCandidate);
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

function _buildFakeSchoolingRegistrationRepository() {
  const isSchoolingRegistrationIdLinkedToUserAndSCOOrganization = sinon.stub();
  return {
    isSchoolingRegistrationIdLinkedToUserAndSCOOrganization,
    withIsSchoolingRegistrationIdLinkedToUserAndSCOOrganization({ args, resolves }) {
      this.isSchoolingRegistrationIdLinkedToUserAndSCOOrganization.withArgs(args).resolves(resolves);
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
