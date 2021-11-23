const { expect, catchErr, sinon, domainBuilder } = require('../../../test-helper');
const getCandidateImportSheetData = require('../../../../lib/domain/usecases/get-candidate-import-sheet-data');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-candidate-import-sheet-data', function () {
  let sessionRepository;
  let certificationCenterRepository;

  beforeEach(function () {
    sessionRepository = {
      doesUserHaveCertificationCenterMembershipForSession: sinon.stub(),
      getWithCertificationCandidates: sinon.stub(),
    };
    certificationCenterRepository = {
      getBySessionId: sinon.stub(),
    };
  });

  context('When user is not a member of the certification center which has created the session', function () {
    it('should throw a UserNotAuthorizedToAccessEntityError', async function () {
      // given
      const userId = 123;
      const sessionId = 456;
      sessionRepository.doesUserHaveCertificationCenterMembershipForSession.withArgs(userId, sessionId).resolves(false);

      // when
      const error = await catchErr(getCandidateImportSheetData)({
        userId,
        sessionId,
        sessionRepository,
        certificationCenterRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  it('should get a session with candidates and the certification center habilitations', async function () {
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
    const complementaryCertification1 = domainBuilder.buildComplementaryCertification({ name: 'Pix+Droit' });
    const complementaryCertification2 = domainBuilder.buildComplementaryCertification({ name: 'Pix+Penché' });
    const certificationCenter = domainBuilder.buildCertificationCenter({
      habilitations: [complementaryCertification1, complementaryCertification2],
    });
    certificationCenterRepository.getBySessionId.withArgs(sessionId).resolves(certificationCenter);

    // when
    const result = await getCandidateImportSheetData({
      userId,
      sessionId,
      sessionRepository,
      certificationCenterRepository,
    });

    // then
    expect(result).to.deepEqualInstance({
      session,
      certificationCenterHabilitations: [complementaryCertification1, complementaryCertification2],
    });
  });
});
