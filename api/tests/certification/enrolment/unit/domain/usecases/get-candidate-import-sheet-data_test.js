import { expect } from 'chai';
import sinon from 'sinon';

import { getCandidateImportSheetData } from '../../../../../../src/certification/enrolment/domain/usecases/get-candidate-import-sheet-data.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | UseCase | get-candidate-import-sheet-data', function () {
  let sessionRepository;
  let centerRepository;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
    };
    centerRepository = {
      getById: sinon.stub(),
    };
  });

  describe('when the session does not exist', function () {
    it('throws a NotFoundError', async function () {
      // given
      const userId = 123;
      const sessionId = 456;
      sessionRepository.get.withArgs({ id: sessionId }).resolves(null);

      // when
      const error = await catchErr(getCandidateImportSheetData)({
        userId,
        sessionId,
        sessionRepository,
        centerRepository,
      });

      // then
      expect(error).to.deepEqualInstance(new NotFoundError("La session n'existe pas ou son accès est restreint"));
    });
  });

  it('should get a session with candidates and the certification center habilitations', async function () {
    // given
    const userId = 123;
    const sessionId = 456;
    const certificationCenterId = 789;
    const michelCandidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withSubscription(Frameworks.CORE)
      .withIdentity({
        firstName: 'Michel',
        lastName: 'Jacques',
      });
    const jeannetteCandidateBuilder = domainBuilder.certification.enrolment
      .candidateBuilder()
      .withSubscription(Frameworks.CORE)
      .withIdentity({
        firstName: 'Jeannette',
        lastName: 'Jacques',
      });
    const session = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .createdBy({ certificationCenterId })
      .addCandidatesBuilders([michelCandidateBuilder, jeannetteCandidateBuilder])
      .build();
    sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
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
      centerRepository,
    });

    // then
    expect(result).to.deep.equal({
      session,
      enrolledCandidates: [jeannetteCandidateBuilder.build(), michelCandidateBuilder.build()],
      certificationCenterHabilitations: [habilitation1, habilitation2],
      isScoCertificationCenter: true,
    });
  });
});
