const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const addCertificationCandidateToSession = require('../../../../lib/domain/usecases/add-certification-candidate-to-session');
const { CertificationCandidateByPersonalInfoTooManyMatchesError, InvalidCertificationCandidate } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | add-certification-candidate-to-session', () => {
  const sessionId = 1;
  let certificationCandidate;

  beforeEach(() => {
    sinon.stub(CertificationCandidate.prototype, 'validate');
    sinon.stub(certificationCandidateRepository, 'findBySessionIdAndPersonalInfo');
    sinon.stub(certificationCandidateRepository, 'saveInSession');
  });

  context('when certification candidate does not pass JOI validation', () => {

    beforeEach(() => {
      CertificationCandidate.prototype.validate.throws(new InvalidCertificationCandidate());
      certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: 'WrongDateFormat', sessionId: null });
    });

    it('should throw an InvalidCertificationCandidate error', async () => {
      // when
      const err = await catchErr(addCertificationCandidateToSession)({
        sessionId,
        certificationCandidate,
        certificationCandidateRepository,
      });

      // then
      expect(err).to.be.instanceOf(InvalidCertificationCandidate);
      expect(certificationCandidateRepository.saveInSession.notCalled).to.be.true;
    });

  });

  context('when certification candidate is valid', () => {

    beforeEach(() => {
      CertificationCandidate.prototype.validate.returns();
      certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
    });

    context('when a candidate already exists in session with personal info', () => {

      beforeEach(() => {
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves(['one match']);
      });

      it('should throw an CertificationCandidateByPersonalInfoTooManyMatchesError', async () => {
        // when
        const err = await catchErr(addCertificationCandidateToSession)({
          sessionId,
          certificationCandidate,
          certificationCandidateRepository,
        });

        // then
        expect(err).to.be.instanceOf(CertificationCandidateByPersonalInfoTooManyMatchesError);
        expect(certificationCandidateRepository.findBySessionIdAndPersonalInfo.calledWithExactly({
          sessionId,
          firstName: certificationCandidate.firstName,
          lastName: certificationCandidate.lastName,
          birthdate: certificationCandidate.birthdate,
        })).to.be.true;
      });

    });

    context('when no candidate exists with personal info', () => {

      beforeEach(() => {
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
        certificationCandidateRepository.saveInSession.resolves();
      });

      it('should save the certification candidate', async () => {
        // when
        await addCertificationCandidateToSession({
          sessionId,
          certificationCandidate,
          certificationCandidateRepository,
        });

        // then
        expect(certificationCandidateRepository.saveInSession).to.has.been.calledWithExactly({ certificationCandidate, sessionId });
      });

      it('should return the certification candidate updated with sessionId', async () => {
        // when
        await addCertificationCandidateToSession({
          sessionId,
          certificationCandidate,
          certificationCandidateRepository,
        });

        // then
        expect(certificationCandidate.sessionId).to.equal(sessionId);
      });
    });
  });
});
