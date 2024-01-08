import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { getCandidateImportSheetData } from '../../../../lib/domain/usecases/get-candidate-import-sheet-data.js';

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
      type: 'SCO',
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
      isScoCertificationCenter: true,
    });
  });
});
