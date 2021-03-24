const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const addCertificationCandidateToSession = require('../../../../lib/domain/usecases/add-certification-candidate-to-session');
const { CertificationCandidateByPersonalInfoTooManyMatchesError, EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | add-certification-candidate-to-session', function() {
  const sessionId = 1;
  let certificationCandidate;

  beforeEach(function() {
    sinon.stub(CertificationCandidate.prototype, 'validate');
    sinon.stub(certificationCandidateRepository, 'findBySessionIdAndPersonalInfo');
    sinon.stub(certificationCandidateRepository, 'saveInSession');
  });

  context('when certification candidate does not pass JOI validation', function() {

    beforeEach(function() {
      CertificationCandidate.prototype.validate.throws(new EntityValidationError({ invalidAttributes: [] }));
      certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: 'WrongDateFormat', sessionId: null });
    });

    it('should throw an EntityValidationError error', async function() {
      // when
      const err = await catchErr(addCertificationCandidateToSession)({
        sessionId,
        certificationCandidate,
        certificationCandidateRepository,
      });

      // then
      expect(err).to.be.instanceOf(EntityValidationError);
      expect(certificationCandidateRepository.saveInSession.notCalled).to.be.true;
    });

  });

  context('when certification candidate is valid', function() {

    beforeEach(function() {
      CertificationCandidate.prototype.validate.returns();
      certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
    });

    context('when a candidate already exists in session with personal info', function() {

      beforeEach(function() {
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves(['one match']);
      });

      it('should throw an CertificationCandidateByPersonalInfoTooManyMatchesError', async function() {
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

    context('when no candidate exists with personal info', function() {

      beforeEach(function() {
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
        certificationCandidateRepository.saveInSession.resolves();
      });

      it('should save the certification candidate', async function() {
        // when
        await addCertificationCandidateToSession({
          sessionId,
          certificationCandidate,
          certificationCandidateRepository,
        });

        // then
        expect(certificationCandidateRepository.saveInSession).to.has.been.calledWithExactly({ certificationCandidate, sessionId });
      });

      it('should return the certification candidate updated with sessionId', async function() {
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
