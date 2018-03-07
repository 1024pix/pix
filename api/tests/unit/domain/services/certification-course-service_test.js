const { describe, it, expect, sinon } = require('../../../test-helper');
const certificationCourseService = require('../../../../lib/domain/services/certification-course-service');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Service | Certification Course Service', function() {

  let certificationCourseRepositoryUpdateStub;

  beforeEach(() => {
    certificationCourseRepositoryUpdateStub = sinon.stub(certificationCourseRepository, 'update');
  });

  afterEach(() => {
    certificationCourseRepositoryUpdateStub.restore();
  });

  describe('#updatedCertifcationCourse', () => {

    const certificationCourse = new CertificationCourse({
      status: 'rejected',
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '24/10/1989',
      rejectionReason: 'Killed all citizens'
    });

    it('should save certification course', () => {
      // given
      certificationCourseRepositoryUpdateStub.resolves();

      // when
      const promise = certificationCourseService.update(certificationCourse);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationCourseRepositoryUpdateStub);
        sinon.assert.calledWith(certificationCourseRepositoryUpdateStub, certificationCourse);
      });
    });

    it('should success and return the object saved', function() {
      // given
      certificationCourseRepositoryUpdateStub.resolves(certificationCourse);

      // when
      const promise = certificationCourseService.update(certificationCourse);

      // then
      return promise.then(result => {
        expect(result).to.be.instanceOf(CertificationCourse);
      });
    });

    context('when save failed', () => {

      it('should return an error', () => {
        // given
        certificationCourseRepositoryUpdateStub.rejects(new NotFoundError);

        // when
        const promise = certificationCourseService.update(certificationCourse);

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });

    });
  });
});
