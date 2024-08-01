import { getCandidateImportSheetData } from '../../../../../../src/certification/enrolment/domain/usecases/get-candidate-import-sheet-data.js';
import { SubscriptionTypes } from '../../../../../../src/certification/shared/domain/models/SubscriptionTypes.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | get-candidate-import-sheet-data', function () {
  let sessionRepository;
  let enrolledCandidateRepository;
  let certificationCenterRepository;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
    };
    enrolledCandidateRepository = {
      findBySessionId: sinon.stub(),
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
      certificationCandidates: [],
    });
    sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
    const enrolledCandidates = [
      domainBuilder.certification.enrolment.buildEnrolledCandidate({
        subscriptions: [
          {
            type: SubscriptionTypes.CORE,
            complementaryCertificationId: null,
            complementaryCertificationLabel: null,
            complementaryCertificationKey: null,
          },
        ],
      }),
      domainBuilder.certification.enrolment.buildEnrolledCandidate({
        subscriptions: [
          {
            type: SubscriptionTypes.CORE,
            complementaryCertificationId: null,
            complementaryCertificationLabel: null,
            complementaryCertificationKey: null,
          },
        ],
      }),
    ];
    enrolledCandidateRepository.findBySessionId.withArgs({ sessionId }).resolves(enrolledCandidates);
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
      sessionRepository,
      enrolledCandidateRepository,
      certificationCenterRepository,
    });

    // then
    expect(result).to.deepEqualInstance({
      session,
      enrolledCandidates,
      certificationCenterHabilitations: [complementaryCertification1, complementaryCertification2],
      isScoCertificationCenter: true,
    });
  });
});
