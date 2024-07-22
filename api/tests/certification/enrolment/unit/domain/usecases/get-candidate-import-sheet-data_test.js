import { getCandidateImportSheetData } from '../../../../../../src/certification/enrolment/domain/usecases/get-candidate-import-sheet-data.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | get-candidate-import-sheet-data', function () {
  let sharedSessionRepository;
  let certificationCenterRepository;

  beforeEach(function () {
    sharedSessionRepository = {
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
    const session = domainBuilder.certification.enrolment.buildSession({
      certificationCandidates: [
        domainBuilder.buildCertificationCandidate({ subscriptions: [domainBuilder.buildCoreSubscription()] }),
        domainBuilder.buildCertificationCandidate({ subscriptions: [domainBuilder.buildCoreSubscription()] }),
      ],
    });
    sharedSessionRepository.getWithCertificationCandidates.withArgs({ id: sessionId }).resolves(session);
    const complementaryCertification1 = domainBuilder.buildComplementaryCertification({ name: 'Pix+Droit' });
    const complementaryCertification2 = domainBuilder.buildComplementaryCertification({ name: 'Pix+Penché' });
    const certificationCenter = domainBuilder.buildCertificationCenter({
      habilitations: [complementaryCertification1, complementaryCertification2],
      type: 'SCO',
    });
    certificationCenterRepository.getBySessionId.withArgs({ sessionId }).resolves(certificationCenter);

    // when
    const result = await getCandidateImportSheetData({
      userId,
      sessionId,
      sharedSessionRepository,
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
