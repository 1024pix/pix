const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationCourse', () => {

  describe('#cancel', () => {

    it('should cancel a certification course', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        isCancelled: false,
      });

      // when
      certificationCourse.cancel();

      // then
      expect(certificationCourse.isCancelled).to.be.true;
    });

    describe('when certification course is already cancelled', () => {
      it('should not change isCancelled value', () => {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          isCancelled: false,
        });

        // when
        certificationCourse.cancel();
        certificationCourse.cancel();

        // then
        expect(certificationCourse.isCancelled).to.be.true;
      });
    });
  });
});
