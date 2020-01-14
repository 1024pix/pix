const { catchErr, expect, sinon } = require('../../../test-helper');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const usecases = require('../../../../lib/domain/usecases');
const {
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
  UserAlreadyLinkedToCandidateInSessionError,
} = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | link-user-to-session-certification-candidate', () => {
  const sessionId = 'sessionId';
  const userId = 'userId';
  let firstName;
  let lastName;
  let birthdate;

  beforeEach(() => {
    firstName = 'Charlie';
    lastName = 'Bideau';
    birthdate = '2010-10-10';
    sinon.stub(CertificationCandidate.prototype, 'validateParticipation');
  });

  context('when there is a problem with the personal info', () => {

    context('when a field is missing from the provided personal info', () => {

      it('should throw a CertificationCandidatePersonalInfoFieldMissingError', async () => {
        // given
        CertificationCandidate.prototype.validateParticipation.throws({ details: { type: 'any.required' } });

        // when
        const err = await catchErr(usecases.linkUserToSessionCertificationCandidate)({
          sessionId,
          userId,
          firstName,
          lastName,
          birthdate,
          certificationCandidateRepository,
        });

        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      });
    });

    context('when a field is in the wrong format', () => {

      it('should throw a CertificationCandidatePersonalInfoWrongFormat', async () => {
        // given
        CertificationCandidate.prototype.validateParticipation.throws({ details: { type: 'any.format' } });

        // when
        const err = await catchErr(usecases.linkUserToSessionCertificationCandidate)({
          sessionId,
          userId,
          firstName,
          lastName,
          birthdate,
          certificationCandidateRepository,
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
        // when
        const err = await catchErr(usecases.linkUserToSessionCertificationCandidate)({
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
        // when
        const err = await catchErr(usecases.linkUserToSessionCertificationCandidate)({
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
    let certificationCandidate;

    context('when the matching certification candidate is already linked to a user', () => {

      context('when the linked user is the same as the user being linked', () => {

        beforeEach(() => {
          certificationCandidate = { userId };
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
          // when
          const result = await usecases.linkUserToSessionCertificationCandidate({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
          });

          // then
          expect(result.linkCreated).to.be.false;
          expect(result.certificationCandidate).to.equal(certificationCandidate);
        });
      });

      context('when the linked user is the not the same as the user being linked', () => {

        beforeEach(() => {
          certificationCandidate = { userId: 'otherUserId' };
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
          const err = await catchErr(usecases.linkUserToSessionCertificationCandidate)({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
          });

          // then
          expect(err).to.be.instanceOf(CertificationCandidateAlreadyLinkedToUserError);
        });
      });
    });

    context('when the matching certification candidate has no link to any user', () => {

      context('when the user is already linked to another candidate in the session', () => {

        beforeEach(() => {
          certificationCandidate = { userId: null };
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
          const err = await catchErr(usecases.linkUserToSessionCertificationCandidate)({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
          });

          // then
          expect(err).to.be.instanceOf(UserAlreadyLinkedToCandidateInSessionError);
        });
      });

      context('when the user is not linked to any candidate in this session', () => {

        beforeEach(() => {
          certificationCandidate = { userId: null, id: 'candidateId' };
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
          // when
          const result = await usecases.linkUserToSessionCertificationCandidate({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
          });

          // then
          expect(result.linkCreated).to.be.true;
          sinon.assert.calledWith(certificationCandidateRepository.linkToUser, { id: certificationCandidate.id, userId });
        });

        it('should trim spaces in first and last name when searching for a candidate', async () => {
          // given
          firstName = ` \t${firstName} \t`;
          lastName = `  \t${lastName} \t`;

          // when
          const result = await usecases.linkUserToSessionCertificationCandidate({
            sessionId,
            userId,
            firstName,
            lastName,
            birthdate,
            certificationCandidateRepository,
          });

          // then
          expect(result.linkCreated).to.be.true;
          sinon.assert.calledWith(certificationCandidateRepository.linkToUser, { id: certificationCandidate.id, userId });
        });
      });
    });
  });
});
