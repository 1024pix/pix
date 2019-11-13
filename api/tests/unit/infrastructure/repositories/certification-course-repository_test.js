const { expect, sinon, domainBuilder } = require('../../../test-helper');

const CertificationCourseRepository = require(
  '../../../../lib/infrastructure/repositories/certification-course-repository');
const CertificationCourseBookshelf = require('../../../../lib/infrastructure/data/certification-course');

describe('Unit | Repository | Certification Course', function() {

  describe('#save', function() {

    let certificationCourse;

    beforeEach(() => {
      const certificationInformation = {
        id: 'certifId',
        userId: 1,
        completedAt: null,
        createdAt: null,
        firstName: 'Antoine',
        lastName: 'Griezmann',
        birthplace: 'Macon',
        birthdate: '1991-03-21',
        sessionId: 'EURO2016',
        externalId: 'xenoverse2',
        isPublished: false,
      };
      certificationCourse = domainBuilder.buildCertificationCourse(certificationInformation);

      const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourse);

      sinon.stub(CertificationCourseBookshelf.prototype, 'save').resolves(certificationCourseBookshelf);
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
        expect(savedCertification.id).to.deep.equal(certificationCourse.id);
      });

    });
  });
});
