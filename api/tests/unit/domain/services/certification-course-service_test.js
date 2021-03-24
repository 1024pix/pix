const { expect, sinon } = require('../../../test-helper');
const certificationCourseService = require('../../../../lib/domain/services/certification-course-service');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Service | Certification Course Service', function() {

  let certificationCourseRepositoryUpdateStub;

  beforeEach(function() {
    certificationCourseRepositoryUpdateStub = sinon.stub(certificationCourseRepository, 'update');
  });

  describe('#updatedCertifcationCourse', function() {

    const certificationCourse = new CertificationCourse({
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '1989-10-24',
    });

    it('should save certification course', function() {
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
      return promise.then((result) => {
        expect(result).to.be.instanceOf(CertificationCourse);
      });
    });

    context('when save failed', function() {

      it('should return an error', function() {
        // given
        certificationCourseRepositoryUpdateStub.rejects(new NotFoundError());

        // when
        const promise = certificationCourseService.update(certificationCourse);

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });

    });
  });
});
