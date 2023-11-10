import { expect, sinon, domainBuilder, catchErr } from '../../../../../test-helper.js';
import { getCertificationAttestationsForSession } from '../../../../../../src/certification/course/domain/usecases/get-certification-attestations-for-session.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

describe('Unit | UseCase | get-certification-attestation-for-session', function () {
  let certificateRepository, certificationCourseRepository;

  beforeEach(function () {
    certificateRepository = {
      getCertificationAttestation: sinon.stub(),
    };
    certificationCourseRepository = {
      findCertificationCoursesBySessionId: sinon.stub(),
    };
  });

  it('should return multiple certification attestations enhanced with result competence tree for a sessions', async function () {
    // given
    domainBuilder.buildSession({
      id: 11,
      finalizedAt: new Date('2020-01-02T14:00:00Z'),
      certificationCenter: 'Centre des deux attestations',
    });

    const certificationCourse1 = domainBuilder.buildCertificationCourse({
      id: 1,
      sessionId: 11,
      userId: 101,
      completedAt: '2020-01-01',
    });
    domainBuilder.buildResultCompetenceTree({ id: 'firstResultTreeId' });
    const certificationAttestation1 = domainBuilder.buildCertificationAttestation({
      id: 1,
      userId: 101,
      resultCompetenceTree: 'firstResultTreeId',
      certificationCenter: 'Centre des deux attestations',
    });

    const certificationCourse2 = domainBuilder.buildCertificationCourse({
      id: 2,
      sessionId: 11,
      userId: 102,
      completedAt: '2020-01-01',
    });
    domainBuilder.buildResultCompetenceTree({ id: 'secondResultTreeId' });
    const certificationAttestation2 = domainBuilder.buildCertificationAttestation({
      id: 2,
      userId: 102,
      resultCompetenceTree: 'secondResultTreeId',
      certificationCenter: 'Centre des deux attestations',
    });

    certificationCourseRepository.findCertificationCoursesBySessionId
      .withArgs({ sessionId: 11 })
      .resolves([certificationCourse1, certificationCourse2]);
    certificateRepository.getCertificationAttestation.withArgs(1).resolves(certificationAttestation1);
    certificateRepository.getCertificationAttestation.withArgs(2).resolves(certificationAttestation2);

    // when
    const actualCertificationAttestations = await getCertificationAttestationsForSession({
      sessionId: 11,
      certificateRepository,
      certificationCourseRepository,
    });

    // then
    const expectedCertificationAttestations = [
      domainBuilder.buildCertificationAttestation({
        id: 1,
        userId: 101,
        resultCompetenceTree: 'firstResultTreeId',
        certificationCenter: 'Centre des deux attestations',
      }),
      domainBuilder.buildCertificationAttestation({
        id: 2,
        userId: 102,
        resultCompetenceTree: 'secondResultTreeId',
        certificationCenter: 'Centre des deux attestations',
      }),
    ];

    expect(actualCertificationAttestations).to.deep.equal(expectedCertificationAttestations);
  });

  describe('when there is no certification courses for the session', function () {
    it('should throw a NotFoundError', async function () {
      // given
      domainBuilder.buildSession({
        id: 12,
        finalizedAt: new Date('2020-01-02T14:00:00Z'),
        certificationCenter: 'Centre sans attestation',
      });

      certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: 12 }).resolves([]);

      // when
      const error = await catchErr(getCertificationAttestationsForSession)({
        sessionId: 12,
        certificateRepository,
        certificationCourseRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  describe('when there is no certification attestations for the session', function () {
    it('should throw a NotFoundError', async function () {
      // given
      domainBuilder.buildSession({
        id: 13,
        finalizedAt: new Date('2020-01-02T14:00:00Z'),
        certificationCenter: 'Centre sans attestation',
      });
      const certificationCourse = domainBuilder.buildCertificationCourse({
        id: 3,
        sessionId: 11,
        userId: 101,
        completedAt: '2020-01-01',
      });

      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 13 })
        .resolves([certificationCourse]);
      certificateRepository.getCertificationAttestation.withArgs(3).resolves();

      // when
      const error = await catchErr(getCertificationAttestationsForSession)({
        sessionId: 13,
        certificateRepository,
        certificationCourseRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });
});
