import sinon from 'sinon';

import { getCandidateImportSheetData } from '../../../../../../src/certification/enrolment/domain/usecases/get-candidate-import-sheet-data.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | UseCase | get-candidate-import-sheet-data', function () {
  let sessionRepository;
  let candidateRepository;
  let centerRepository;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
    };
    candidateRepository = {
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
    const michelCandidate = domainBuilder.certification.enrolment.buildCandidate({
      firstName: 'Michel',
      lastName: 'Jacques',
      subscription: Frameworks.CORE,
    });
    const jeannetteCandidate = domainBuilder.certification.enrolment.buildCandidate({
      firstName: 'Jeannette',
      lastName: 'Jacques',
      subscription: Frameworks.CORE,
    });
    const enrolledCandidates = [michelCandidate, jeannetteCandidate];
    candidateRepository.findBySessionId.withArgs({ sessionId }).resolves(enrolledCandidates);
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
      candidateRepository,
      centerRepository,
    });

    // then
    expect(result).to.deepEqualInstance({
      session,
      enrolledCandidates: [jeannetteCandidate, michelCandidate],
      certificationCenterHabilitations: [habilitation1, habilitation2],
      isScoCertificationCenter: true,
    });
  });
});
