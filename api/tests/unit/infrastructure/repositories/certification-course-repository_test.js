const { expect, sinon } = require('../../../test-helper');
const factory = require('../../../factory');

const CertificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const CertificationCourseBookshelf = require('../../../../lib/infrastructure/data/certification-course');

const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Repository | Certification Course', function() {

  describe('#save', function() {

    let certificationCourse;
    let savedCertificationCourse;

    beforeEach(() => {
      const certificationInformation = {
        id: 'certifId',
        userId: 1,
        completedAt: null,
        createdAt: null,
        firstName: 'Antoine',
        lastName: 'Griezmann',
        birthplace: 'Macon',
        birthdate: '21/03/1991',
        sessionId: 'EURO2016',
        externalId: 'xenoverse2',
        isPublished: false,
      };
      certificationCourse = factory.buildCertificationCourse(certificationInformation);

      savedCertificationCourse = factory.buildCertificationCourse(certificationInformation);
      savedCertificationCourse.type = Assessment.types.CERTIFICATION;
      savedCertificationCourse.challenges = [];
      savedCertificationCourse.assessment = {};

      const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourse);

      sinon.stub(CertificationCourseBookshelf.prototype, 'save').resolves(certificationCourseBookshelf);
    });

    afterEach(() => {
      CertificationCourseBookshelf.prototype.save.restore();
    });

    it('should save the certification-course', () => {
      // when
      const promise = CertificationCourseRepository.save(certificationCourse);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationCourseBookshelf.prototype.save);
      });

    });

    it('return the saved certification course in JSON ', () => {
      // when
      const promise = CertificationCourseRepository.save(certificationCourse);

      // then
      return promise.then((savedCertification) => {
        expect(savedCertification).to.deep.equal(savedCertificationCourse);
      });

    });
  });
});
