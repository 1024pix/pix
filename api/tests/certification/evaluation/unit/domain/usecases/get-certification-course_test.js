import sinon from 'sinon';

import { getCertificationCourse } from '../../../../../../src/certification/evaluation/domain/usecases/get-certification-course.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | get-certification-course', function () {
  let certificationCourse;
  let version;

  let certificationCourseRepository;
  let versionApi;

  beforeEach(function () {
    certificationCourse = domainBuilder.buildCertificationCourse({
      id: 'certification_course_id',
      sessionId: 'session_id',
      userId: 'user_id',
      version: AlgorithmEngineVersion.V3,
      versionId: 123,
    });

    certificationCourseRepository = {
      get: sinon.stub(),
    };

    versionApi = {
      getById: sinon.stub(),
    };

    version = domainBuilder.certification.configuration
      .versionBuilder()
      .withParameters({ id: 123, challengesConfiguration: { maximumAssessmentLength: 42 } })
      .build();
  });

  it('should get the certificationCourse with numberOfChallenges from version', async function () {
    certificationCourseRepository.get.withArgs({ id: certificationCourse.getId() }).resolves(certificationCourse);
    versionApi.getById.resolves(version);

    const actualCertificationCourse = await getCertificationCourse({
      certificationCourseId: certificationCourse.getId(),
      certificationCourseRepository,
      versionApi,
    });

    expect(certificationCourseRepository.get).to.have.been.calledOnceWithExactly({
      id: certificationCourse.getId(),
    });
    expect(versionApi.getById).to.have.been.calledOnceWithExactly({ id: 123 });
    expect(actualCertificationCourse.getNumberOfChallenges()).to.equal(42);
    expect(actualCertificationCourse.getId()).to.equal(certificationCourse.getId());
  });
});
