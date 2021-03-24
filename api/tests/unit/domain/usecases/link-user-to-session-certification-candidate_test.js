const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { linkUserToSessionCertificationCandidate } = require('../../../../lib/domain/usecases/link-user-to-session-certification-candidate');
const {
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  MatchingReconciledStudentNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
  UserAlreadyLinkedToCandidateInSessionError,
} = require('../../../../lib/domain/errors');
const UserLinkedToCertificationCandidate = require('../../../../lib/domain/events/UserLinkedToCertificationCandidate');
const UserAlreadyLinkedToCertificationCandidate = require('../../../../lib/domain/events/UserAlreadyLinkedToCertificationCandidate');

describe('Unit | Domain | Use Cases | link-user-to-session-certification-candidate', () => {
  const sessionId = 42;
  const userId = 'userId';
  let firstName;
  let lastName;
  let birthdate;
  let certificationCandidateRepository;

  beforeEach(() => {
    firstName = 'Charlie';
    lastName = 'Bideau';
    birthdate = '2010-10-10';
  });

  context('when there is a problem with the personal info', () => {

    context('when a field is missing from the provided personal info', () => {

      it('should throw a CertificationCandidatePersonalInfoFieldMissingError', async () => {
        // given
        firstName = undefined;
        const sessionRepository = _buildFakeSessionRepository()
          .withIsSco({ args: sessionId, resolves: false });

        // when
        const err = await catchErr(linkUserToSessionCertificationCandidate)({
          sessionId,
          userId,
          firstName,
          lastName,
          birthdate,
          certificationCandidateRepository,
          sessionRepository,
        });

        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      });
    });

    context('when a field is in the wrong format', () => {

      it('should throw a CertificationCandidatePersonalInfoWrongFormat', async () => {
        // given
        birthdate = 'invalid format';
        const sessionRepository = _buildFakeSessionRepository()
          .withIsSco({ args: sessionId, resolves: false });

        // when
        const err = await catchErr(linkUserToSessionCertificationCandidate)({
          sessionId,
          userId,
          firstName,
          lastName,
          birthdate,
          certificationCandidateRepository,
          sessionRepository,
        });

        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      });
    });

    context('when no certification candidates match with the provided personal info', () => {

      it('should throw a CertificationCandidateByPersonalInfoNotFoundError', async () => {
        // given
        const sessionRepository = _buildFakeSessionRepository()
          .withIsSco({ args: sessionId, resolves: false });
        certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
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
          sessionRepository,
        });

        // then
        expect(err).to.be.instanceOf(CertificationCandidateByPersonalInfoNotFoundError);
      });
    });

    context('when there are more than one certification candidates that match with the provided personal info', () => {

      it('should throw a CertificationCandidateByPersonalInfoTooManyMatchesError', async () => {
        // given
        const sessionRepository = _buildFakeSessionRepository()
          .withIsSco({ args: sessionId, resolves: false });
        certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
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
          sessionRepository,
        });

        // then
        expect(err).to.be.instanceOf(CertificationCandidateByPersonalInfoTooManyMatchesError);
      });
    });
  });

  context('when there is exactly one certification candidate that matches with the provided personal info', () => {
    let certificationCandidate;

    context('when the matching certification candidate is already linked to a user', () => {

      context('when the linked user is the same as the user being linked', () => {

        it('should not create a link and return the matching certification candidate', async () => {
          // given
          const sessionRepository = _buildFakeSessionRepository()
            .withIsSco({ args: sessionId, resolves: false });
          certificationCandidate = domainBuilder.buildCertificationCandidate({ userId });
          certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
            .withFindBySessionIdAndPersonalInfo({
              args: {
                sessionId,
                firstName,
                lastName,
                birthdate,
              },
              resolves: [certificationCandidate],
            });

          // when
          const result = await linkUserToSessionCertificationCandidate({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
            sessionRepository,
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
          const sessionRepository = _buildFakeSessionRepository()
            .withIsSco({ args: sessionId, resolves: false });
          certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: 'otherUserId' });
          certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
            .withFindBySessionIdAndPersonalInfo({
              args: {
                sessionId,
                firstName,
                lastName,
                birthdate,
              },
              resolves: [certificationCandidate],
            });

          // when
          const err = await catchErr(linkUserToSessionCertificationCandidate)({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
            sessionRepository,
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
          const sessionRepository = _buildFakeSessionRepository()
            .withIsSco({ args: sessionId, resolves: false });
          certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: null });
          certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
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

          // when
          const err = await catchErr(linkUserToSessionCertificationCandidate)({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
            sessionRepository,
          });

          // then
          expect(err).to.be.instanceOf(UserAlreadyLinkedToCandidateInSessionError);
        });
      });

      context('when the user is not linked to any candidate in this session', () => {

        it('should create a link with between the candidate and the user and return the linked certification candidate', async () => {
          // given
          const sessionRepository = _buildFakeSessionRepository()
            .withIsSco({ args: sessionId, resolves: false });
          certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: null, id: 'candidateId' });
          certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
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

          // when
          const result = await linkUserToSessionCertificationCandidate({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
            sessionRepository,
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

  context('when the session is of type SCO', () => {

    context('when the user does not match with a session candidate and its schooling registration', () => {
      it('throws MatchingReconciledStudentNotFoundError', async () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          userId: null,
          firstName, lastName, birthdate,
        });
        const sessionRepository = _buildFakeSessionRepository()
          .withIsSco({ args: sessionId, resolves: true });
        const certificationCandidateRepository = _buildFakeCertificationCandidateRepository()
          .withFindBySessionIdAndPersonalInfo({
            args: {
              sessionId,
              firstName,
              lastName,
              birthdate,
            },
            resolves: [certificationCandidate] });

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
          sessionRepository,
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
          const sessionRepository = _buildFakeSessionRepository()
            .withIsSco({ args: sessionId, resolves: true });
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
            sessionRepository,
          });

          // then
          expect(certificationCandidateRepository.linkToUser).to.have.been.calledWith({
            id: certificationCandidate.id,
            userId,
          });
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
          const sessionRepository = _buildFakeSessionRepository()
            .withIsSco({ args: sessionId, resolves: true });
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
            sessionRepository,
          });

          // then
          expect(error).to.be.an.instanceof(UserAlreadyLinkedToCandidateInSessionError);
        });
      });
    });
  });
});

function _buildFakeSessionRepository() {
  const isSco = sinon.stub();
  return {
    isSco,
    withIsSco({ args, resolves }) {
      this.isSco.withArgs(args).resolves(resolves);
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
