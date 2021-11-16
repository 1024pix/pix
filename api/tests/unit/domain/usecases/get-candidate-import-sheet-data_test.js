const { expect, catchErr, sinon, domainBuilder } = require('../../../test-helper');
const getCandidateImportSheetData = require('../../../../lib/domain/usecases/get-candidate-import-sheet-data');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-candidate-import-sheet-data', function () {
  let sessionRepository;

  beforeEach(function () {
    sessionRepository = {
      doesUserHaveCertificationCenterMembershipForSession: sinon.stub(),
      getWithCertificationCandidates: sinon.stub(),
    };
  });

  context('When user is not a member of the certification center which has created the session', function () {
    it('should throw a UserNotAuthorizedToAccessEntityError', async function () {
      // given
      const userId = 123;
      const sessionId = 456;
      sessionRepository.doesUserHaveCertificationCenterMembershipForSession.withArgs(userId, sessionId).resolves(false);

      // when
      const error = await catchErr(getCandidateImportSheetData)({ userId, sessionId, sessionRepository });

      // then
      expect(error).to.be.an.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  it('should get a session with candidates', async function () {
    // given
    const userId = 123;
    const sessionId = 456;
    sessionRepository.doesUserHaveCertificationCenterMembershipForSession.withArgs(userId, sessionId).resolves(true);
    const session = domainBuilder.buildSession({
      certificationCandidates: [
        domainBuilder.buildCertificationCandidate(),
        domainBuilder.buildCertificationCandidate(),
      ],
    });
    sessionRepository.getWithCertificationCandidates.withArgs(sessionId).resolves(session);

    // when
    const result = await getCandidateImportSheetData({ userId, sessionId, sessionRepository });

    // then
    expect(result).to.deepEqualInstance(session);
  });
});
