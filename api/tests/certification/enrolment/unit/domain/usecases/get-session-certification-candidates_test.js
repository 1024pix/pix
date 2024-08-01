import { getSessionCertificationCandidates } from '../../../../../../src/certification/enrolment/domain/usecases/get-session-certification-candidates.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-session-certification-candidates', function () {
  let candidateRepository, complementaryCertificationRepository;

  beforeEach(function () {
    // given
    candidateRepository = { findBySessionId: sinon.stub() };
    complementaryCertificationRepository = { getById: sinon.stub() };
  });

  it('should return the certification candidates', async function () {
    // given
    const sessionId = 1024;
    const candidate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate({
      complementaryCertificationId: 1,
    });
    candidate.userId = undefined;
    const complementaryCertification =
      domainBuilder.certification.sessionManagement.buildCertificationSessionComplementaryCertification({
        id: candidate.complementaryCertificationId,
      });
    candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([candidate]);
    complementaryCertificationRepository.getById
      .withArgs({
        complementaryCertificationId: candidate.complementaryCertificationId,
      })
      .resolves(complementaryCertification);
    const expectedCandidate = domainBuilder.certification.enrolment.buildEnrolledCandidate({
      complementaryCertificationId: candidate.complementaryCertificationId,
      complementaryCertificationLabel: 'JACKSON',
      complementaryCertificationKey: 'CLEA',
      isLinked: false,
    });

    // when
    const actualCandidates = await getSessionCertificationCandidates({
      sessionId,
      candidateRepository,
      complementaryCertificationRepository,
    });

    // then
    expect(actualCandidates).to.deep.equal([expectedCandidate]);
  });

  context('when candidate has no complementary certification', function () {
    it('should return the certification candidates without complementary', async function () {
      // given
      const sessionId = 1024;
      const candidate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate({
        complementaryCertificationId: undefined,
      });
      candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([candidate]);
      const expectedCandidate = domainBuilder.certification.enrolment.buildEnrolledCandidate({
        isLinked: true,
      });

      // when
      const actualCandidates = await getSessionCertificationCandidates({
        sessionId,
        candidateRepository,
        complementaryCertificationRepository,
      });

      // then
      expect(actualCandidates).to.deep.equal([expectedCandidate]);
    });
  });
});
