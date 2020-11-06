const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const { linkUserToSessionCertificationCandidate } = require('../../../../lib/domain/usecases/link-user-to-session-certification-candidate');
const {
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
  UserAlreadyLinkedToCandidateInSessionError,
} = require('../../../../lib/domain/errors');
const { UserLinkedEvent, UserAlreadyLinkedEvent } = require('../../../../lib/domain/usecases/link-user-to-session-certification-candidate');

describe('Unit | Domain | Use Cases | link-user-to-session-certification-candidate', () => {
  const sessionId = 42;
  const userId = 'userId';
  let firstName;
  let lastName;
  let birthdate;

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
        const sessionRepository = _buildFakeSessionRepository({ sessionId, isSco: false });

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
        const sessionRepository = _buildFakeSessionRepository({ sessionId, isSco: false });

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

      beforeEach(() => {
        sinon.stub(certificationCandidateRepository,
          'findBySessionIdAndPersonalInfo')
          .withArgs({
            sessionId,
            firstName: firstName,
            lastName: lastName,
            birthdate: birthdate,
          }).resolves([]);
      });

      it('should throw a CertificationCandidateByPersonalInfoNotFoundError', async () => {
        // given
        const sessionRepository = _buildFakeSessionRepository({ sessionId, isSco: false });

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

      beforeEach(() => {
        sinon.stub(certificationCandidateRepository,
          'findBySessionIdAndPersonalInfo')
          .withArgs({
            sessionId,
            firstName: firstName,
            lastName: lastName,
            birthdate: birthdate,
          }).resolves(['candidate1', 'candidate2']);
      });

      it('should throw a CertificationCandidateByPersonalInfoTooManyMatchesError', async () => {
        // given
        const sessionRepository = _buildFakeSessionRepository({ sessionId, isSco: false });

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

        beforeEach(() => {
          certificationCandidate = domainBuilder.buildCertificationCandidate({ userId });
          sinon.stub(certificationCandidateRepository,
            'findBySessionIdAndPersonalInfo')
            .withArgs({
              sessionId,
              firstName: firstName,
              lastName: lastName,
              birthdate: birthdate,
            }).resolves([certificationCandidate]);
        });

        it('should not create a link and return the matching certification candidate', async () => {
          // given
          const sessionRepository = _buildFakeSessionRepository({ sessionId, isSco: false });

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
            new UserAlreadyLinkedEvent(certificationCandidate),
          );
        });
      });

      context('when the linked user is the not the same as the user being linked', () => {

        beforeEach(() => {
          certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: 'otherUserId' });
          sinon.stub(certificationCandidateRepository,
            'findBySessionIdAndPersonalInfo')
            .withArgs({
              sessionId,
              firstName: firstName,
              lastName: lastName,
              birthdate: birthdate,
            }).resolves([certificationCandidate]);
        });

        it('should throw a CertificationCandidateAlreadyLinkedToUserError', async () => {
          // given
          const sessionRepository = _buildFakeSessionRepository({ sessionId, isSco: false });

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

        beforeEach(() => {
          certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: null });
          sinon.stub(certificationCandidateRepository,
            'findBySessionIdAndPersonalInfo')
            .withArgs({
              sessionId,
              firstName: firstName,
              lastName: lastName,
              birthdate: birthdate,
            }).resolves([certificationCandidate]);
          sinon.stub(certificationCandidateRepository,
            'findOneBySessionIdAndUserId')
            .withArgs({ sessionId, userId }).resolves('existingLinkedCandidateToUser');
        });

        it('should throw a UserAlreadyLinkedToCandidateInSessionError', async () => {
          // given
          const sessionRepository = _buildFakeSessionRepository({ sessionId, isSco: false });

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

        beforeEach(() => {
          certificationCandidate = domainBuilder.buildCertificationCandidate({ userId: null, id: 'candidateId' });
          sinon.stub(certificationCandidateRepository, 'findBySessionIdAndPersonalInfo')
            .withArgs({
              sessionId,
              firstName: firstName,
              lastName: lastName,
              birthdate: birthdate,
            })
            .resolves([certificationCandidate]);

          sinon.stub(certificationCandidateRepository, 'findOneBySessionIdAndUserId')
            .withArgs({ sessionId, userId })
            .resolves(undefined);

          sinon.stub(certificationCandidateRepository, 'linkToUser')
            .resolves();
        });

        it('should create a link and return the linked certification candidate', async () => {
          // given
          const sessionRepository = _buildFakeSessionRepository({ sessionId, isSco: false });

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
          expect(result).to.deep.equal(new UserLinkedEvent(certificationCandidate));
          sinon.assert.calledWith(certificationCandidateRepository.linkToUser, { id: certificationCandidate.id, userId });
        });
      });
    });
  });

  context('when the session is of type SCO', () => {
    it('throws an exception (temporary for building test)', async () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ userId });
      sinon.stub(certificationCandidateRepository,
        'findBySessionIdAndPersonalInfo')
        .withArgs({
          sessionId,
          firstName: firstName,
          lastName: lastName,
          birthdate: birthdate,
        }).resolves([certificationCandidate]);

      const sessionRepository = _buildFakeSessionRepository({ sessionId, isSco: true });

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

      expect(err).to.be.instanceOf(Error);
    });
  });
});

function _buildFakeSessionRepository({ sessionId, isSco }) {
  const isScoStub = sinon.stub();
  isScoStub.withArgs(sessionId).resolves(isSco);
  return { isSco: isScoStub };
}
