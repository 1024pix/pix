import sinon from 'sinon';

import { getCertificatesForSession } from '../../../../../../src/certification/results/domain/usecases/get-certificates-for-session.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-certificates-for-session', function () {
  let certificateRepository, sharedCertificationCourseRepository;

  beforeEach(function () {
    certificateRepository = {
      getCertificate: sinon.stub(),
    };
    sharedCertificationCourseRepository = {
      findCertificationCoursesBySessionId: sinon.stub(),
    };
  });

  it('should return multiple certificates enhanced with result competence tree for a sessions', async function () {
    // given
    domainBuilder.certification.sessionManagement.buildSessionManagement({
      id: 11,
      finalizedAt: new Date('2020-01-02T14:00:00Z'),
      certificationCenter: 'Centre des deux certificats',
    });

    const certificationCourse1 = domainBuilder.buildCertificationCourse({
      id: 1,
      sessionId: 11,
      userId: 101,
      completedAt: '2020-01-01',
    });
    domainBuilder.buildResultCompetenceTree({ id: 'firstResultTreeId' });
    const certificate1 = domainBuilder.buildCertificationAttestation({
      id: 1,
      userId: 101,
      resultCompetenceTree: 'firstResultTreeId',
      certificationCenter: 'Centre des deux certificats',
    });

    const certificationCourse2 = domainBuilder.buildCertificationCourse({
      id: 2,
      sessionId: 11,
      userId: 102,
      completedAt: '2020-01-01',
    });
    domainBuilder.buildResultCompetenceTree({ id: 'secondResultTreeId' });
    const certificate2 = domainBuilder.buildCertificationAttestation({
      id: 2,
      userId: 102,
      resultCompetenceTree: 'secondResultTreeId',
      certificationCenter: 'Centre des deux certificats',
    });

    sharedCertificationCourseRepository.findCertificationCoursesBySessionId
      .withArgs({ sessionId: 11 })
      .resolves([certificationCourse1, certificationCourse2]);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 1 }).resolves(certificate1);
    certificateRepository.getCertificate.withArgs({ certificationCourseId: 2 }).resolves(certificate2);

    // when
    const actualCertificates = await getCertificatesForSession({
      sessionId: 11,
      certificateRepository,
      sharedCertificationCourseRepository,
    });

    // then
    const expectedCertificates = [
      domainBuilder.buildCertificationAttestation({
        id: 1,
        userId: 101,
        resultCompetenceTree: 'firstResultTreeId',
        certificationCenter: 'Centre des deux certificats',
      }),
      domainBuilder.buildCertificationAttestation({
        id: 2,
        userId: 102,
        resultCompetenceTree: 'secondResultTreeId',
        certificationCenter: 'Centre des deux certificats',
      }),
    ];

    expect(actualCertificates).to.deep.equal(expectedCertificates);
  });

  describe('when there is no certification courses for the session', function () {
    it('should throw a NotFoundError', async function () {
      // given
      domainBuilder.certification.sessionManagement.buildSessionManagement({
        id: 12,
        finalizedAt: new Date('2020-01-02T14:00:00Z'),
        certificationCenter: 'Centre sans attestation',
      });

      sharedCertificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: 12 }).resolves([]);

      // when
      const error = await catchErr(getCertificatesForSession)({
        sessionId: 12,
        certificateRepository,
        sharedCertificationCourseRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  describe('when there is no certificate for the session', function () {
    it('should throw a NotFoundError', async function () {
      // given
      domainBuilder.certification.sessionManagement.buildSessionManagement({
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

      sharedCertificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 13 })
        .resolves([certificationCourse]);
      certificateRepository.getCertificate.withArgs({ certificationCourseId: 3 }).resolves();

      // when
      const error = await catchErr(getCertificatesForSession)({
        sessionId: 13,
        certificateRepository,
        sharedCertificationCourseRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });
});
