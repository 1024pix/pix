import { getCandidateImportSheetData } from '../../../../../../src/certification/enrolment/domain/usecases/get-candidate-import-sheet-data.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | get-candidate-import-sheet-data', function () {
  let sessionRepository;
  let enrolledCandidateRepository;
  let centerRepository;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
    };
    enrolledCandidateRepository = {
      findBySessionId: sinon.stub(),
    };
    centerRepository = {
      getById: sinon.stub(),
    };
  });

  it('should get a session with candidates and the certification center habilitations', async function () {
    // given
    const userId = 123;
    const sessionId = 456;
    const certificationCenterId = 789;
    const session = domainBuilder.certification.enrolment.buildSession({
      certificationCenterId,
      certificationCandidates: [],
    });
    sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
    const enrolledCandidates = [
      domainBuilder.certification.enrolment.buildEnrolledCandidate({
        subscriptions: [
          {
            type: SUBSCRIPTION_TYPES.CORE,
            complementaryCertificationId: null,
            complementaryCertificationLabel: null,
            complementaryCertificationKey: null,
          },
        ],
      }),
      domainBuilder.certification.enrolment.buildEnrolledCandidate({
        subscriptions: [
          {
            type: SUBSCRIPTION_TYPES.CORE,
            complementaryCertificationId: null,
            complementaryCertificationLabel: null,
            complementaryCertificationKey: null,
          },
        ],
      }),
    ];
    enrolledCandidateRepository.findBySessionId.withArgs({ sessionId }).resolves(enrolledCandidates);
    const habilitation1 = domainBuilder.certification.enrolment.buildHabilitation({ label: 'Pix+Droit' });
    const habilitation2 = domainBuilder.certification.enrolment.buildHabilitation({ label: 'Pix+Penché' });
    const center = domainBuilder.certification.enrolment.buildCenter({
      habilitations: [habilitation1, habilitation2],
      type: CERTIFICATION_CENTER_TYPES.SCO,
    });
    centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(center);

    // when
    const result = await getCandidateImportSheetData({
      userId,
      sessionId,
      sessionRepository,
      enrolledCandidateRepository,
      centerRepository,
    });

    // then
    expect(result).to.deepEqualInstance({
      session,
      enrolledCandidates,
      certificationCenterHabilitations: [habilitation1, habilitation2],
      isScoCertificationCenter: true,
    });
  });
});
