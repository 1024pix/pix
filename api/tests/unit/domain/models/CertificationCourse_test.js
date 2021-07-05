const { expect, domainBuilder } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CertificationCourse', () => {
  describe('#cancel #isCancelled', () => {

    it('should cancel a certification course', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        isCancelled: false,
      });

      // when
      certificationCourse.cancel();

      // then
      expect(certificationCourse.toDTO().isCancelled).to.be.true;
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
        expect(certificationCourse.toDTO().isCancelled).to.be.true;
      });
    });
  });

  describe('#modifyBirthdate', () => {
    ['2000-13-01', null, undefined, '', 'invalid']
      .forEach((invalidDate) => {
        it(`throws if date is invalid : ${invalidDate}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse();

          // when / then
          expect(() => {
            certificationCourse.modifyBirthdate(invalidDate);
          }).to.throw(EntityValidationError);
        });
      });

    it('modifies the birthdate', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        birthdate: '1999-12-31',
      });

      // when
      certificationCourse.modifyBirthdate('2000-01-01');

      // then
      expect(certificationCourse.toDTO().birthdate).to.equal('2000-01-01');
    });
  });

  describe('#modifyFirstName', () => {
    [null, undefined, '', '   ']
      .forEach((invalidFirstName) => {
        it(`throws if first name is invalid : ${invalidFirstName}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse();

          // when / then
          expect(() => {
            certificationCourse.modifyFirstName(invalidFirstName);
          }).to.throw(EntityValidationError);
        });
      });

    it('collapses white spaces and modifies the first name', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        firstName: 'John',
      });

      // when
      certificationCourse.modifyFirstName('Marie  Claire');

      // then
      expect(certificationCourse.toDTO().firstName).to.equal('Marie Claire');
    });
  });

  describe('#modifyLastName', () => {
    [null, undefined, '', '   ']
      .forEach((invalidLastName) => {
        it(`throws if last name is invalid : ${invalidLastName}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse();

          // when / then
          expect(() => {
            certificationCourse.modifyLastName(invalidLastName);
          }).to.throw(EntityValidationError);
        });
      });

    it('collapses white spaces and modifies the last name', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        lastName: 'Doe',
      });

      // when
      certificationCourse.modifyLastName('De  Montmirail');

      // then
      expect(certificationCourse.toDTO().lastName).to.equal('De Montmirail');
    });
  });

  describe('#modifyBirthplace', () => {
    [null, undefined, '', '   ']
      .forEach((invalidBirthPlace) => {
        it(`throws if birthplace is invalid : ${invalidBirthPlace}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse();

          // when / then
          expect(() => {
            certificationCourse.modifyBirthplace(invalidBirthPlace);
          }).to.throw(EntityValidationError);
        });
      });

    it('collapses white spaces and modifies the birthplace', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        birthplace: 'Paris',
      });

      // when
      certificationCourse.modifyBirthplace('New  York');

      // then
      expect(certificationCourse.toDTO().birthplace).to.equal('New York');
    });
  });

});
