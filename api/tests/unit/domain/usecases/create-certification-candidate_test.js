const { expect, sinon, domainBuilder } = require('../../../test-helper');
const createCertificationCandidate = require('../../../../lib/domain/usecases/create-certification-candidate');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Unit | UseCase | create-certification-candidate', () => {

  let result;
  const userId = 1;
  const sessionId = 2;
  const sessionRepository = { ensureUserHasAccessToSession: _.noop };
  const certificationCandidateRepository = { save: _.noop };
  const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId });
  certificationCandidate.id = undefined;
  const savedCertificationCandidate = domainBuilder.buildCertificationCandidate({
    id: certificationCandidate.id,
    firstName: certificationCandidate.firstName,
    lastName: certificationCandidate.lastName,
    birthCity: certificationCandidate.birthCity,
    birthProvince: certificationCandidate.birthProvince,
    birthCountry: certificationCandidate.birthCountry,
    birthdate: certificationCandidate.birthdate,
    externalId: certificationCandidate.externalId,
    extraTimePercentage: certificationCandidate.extraTimePercentage,
    sessionId: certificationCandidate.sessionId,
  });

  context('user does not have access to the session', () => {
    beforeEach(async () => {
      // given
      sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').rejects();

      // when
      try {
        result = await createCertificationCandidate({
          userId,
          sessionRepository,
          certificationCandidateRepository,
          certificationCandidate
        });
      } catch (err) {
        result = err;
      }
    });

    it('should return an error when user does not have access', () => {
      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });

  });

  context('user has access to the session', () => {

    beforeEach(() => {
      // given
      sinon.stub(certificationCandidateRepository, 'save');
      certificationCandidateRepository.save.resolves(savedCertificationCandidate);
      sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').resolves();
    });

    it('should save the certification candidate', async () => {
      // when
      const actuallySavedCertificationCandidate = await createCertificationCandidate({
        userId,
        sessionId,
        sessionRepository,
        certificationCandidateRepository,
        certificationCandidate
      });

      expect(certificationCandidateRepository.save).to.have.been.called;
      expect(_.omit(actuallySavedCertificationCandidate, ['id'])).to.deep.equal(_.omit(savedCertificationCandidate, ['id']));

    });

  });

});
