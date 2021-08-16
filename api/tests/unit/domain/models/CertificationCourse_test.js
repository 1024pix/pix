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

  describe('#uncancel #isCancelled', () => {

    it('should uncancel a certification course', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        isCancelled: true,
      });

      // when
      certificationCourse.uncancel();

      // then
      expect(certificationCourse.toDTO().isCancelled).to.be.false;
    });

    describe('when certification course is already uncancelled', () => {
      it('should not change isCancelled value', () => {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          isCancelled: true,
        });

        // when
        certificationCourse.uncancel();
        certificationCourse.uncancel();

        // then
        expect(certificationCourse.toDTO().isCancelled).to.be.false;
      });
    });
  });

  describe('#correctBirthdate', () => {
    ['2000-13-01', null, undefined, '', 'invalid']
      .forEach((invalidDate) => {
        it(`throws if date is invalid : ${invalidDate}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse();

          // when / then
          expect(() => {
            certificationCourse.correctBirthdate(invalidDate);
          }).to.throw(EntityValidationError);
        });
      });

    it('modifies the birthdate', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        birthdate: '1999-12-31',
      });

      // when
      certificationCourse.correctBirthdate('2000-01-01');

      // then
      expect(certificationCourse.toDTO().birthdate).to.equal('2000-01-01');
    });
  });

  describe('#correctFirstName', () => {
    [null, undefined, '', '   ']
      .forEach((invalidFirstName) => {
        it(`throws if first name is invalid : ${invalidFirstName}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse();

          // when / then
          expect(() => {
            certificationCourse.correctFirstName(invalidFirstName);
          }).to.throw(EntityValidationError);
        });
      });

    it('collapses white spaces and modifies the first name', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        firstName: 'John',
      });

      // when
      certificationCourse.correctFirstName('Marie  Claire');

      // then
      expect(certificationCourse.toDTO().firstName).to.equal('Marie Claire');
    });
  });

  describe('#correctLastName', () => {
    [null, undefined, '', '   ']
      .forEach((invalidLastName) => {
        it(`throws if last name is invalid : ${invalidLastName}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse();

          // when / then
          expect(() => {
            certificationCourse.correctLastName(invalidLastName);
          }).to.throw(EntityValidationError);
        });
      });

    it('collapses white spaces and modifies the last name', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        lastName: 'Doe',
      });

      // when
      certificationCourse.correctLastName('De  Montmirail');

      // then
      expect(certificationCourse.toDTO().lastName).to.equal('De Montmirail');
    });
  });

  describe('#correctBirthplace', () => {
    [null, undefined, '', '   ']
      .forEach((invalidBirthPlace) => {
        it(`does not modify if birthplace is invalid : ${invalidBirthPlace}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse({
            birthplace: 'some place',
          });

          // when
          certificationCourse.correctBirthplace(invalidBirthPlace);

          // then
          expect(certificationCourse.toDTO().birthplace).to.equal('some place');
        });

        it(`does not throw if birthplace is invalid : ${invalidBirthPlace}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse();

          // when / then
          expect(() => {
            certificationCourse.correctBirthplace(invalidBirthPlace);
          }).not.to.throw();
        });
      });

    it('collapses white spaces and modifies the birthplace', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        birthplace: 'Paris',
      });

      // when
      certificationCourse.correctBirthplace('New  York');

      // then
      expect(certificationCourse.toDTO().birthplace).to.equal('New York');
    });
  });

  describe('#correctSex', () => {

    it('throws if sex is neither M nor F', () => {
      // given
      const invalidSex = 'invalid_sex';
      const certificationCourse = domainBuilder.buildCertificationCourse({
        sex: 'M',
      });

      // then
      expect(() => certificationCourse.correctSex(invalidSex)).to.throw(EntityValidationError);
    });

    it('not throw if sex is not defined', () => {
      // given
      const sex = null;
      const certificationCourse = domainBuilder.buildCertificationCourse({
        sex: 'M',
      });

      // then
      expect(() => certificationCourse.correctSex(sex)).not.to.throw(EntityValidationError);
    });

    ['M', 'F']
      .forEach((validSex) => {
        it(`modifies the sex when value is ${validSex}`, () => {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse({
            sex: 'X',
          });

          // when
          certificationCourse.correctSex(validSex);

          // then
          expect(certificationCourse.toDTO().sex).to.equal(validSex);
        });
      });
  });

  describe('#correctBirthInformation', () => {

    it('should set birth information to certification course', () => {
      // given
      const birthCountry = 'FRANCE';
      const birthCity = 'PARIS 10';
      const birthPostalCode = '75010';
      const birthINSEECode = '75110';

      const certificationCourse = domainBuilder.buildCertificationCourse({
        birthCountry: 'birthCountry',
        birthCity: 'birthCity',
        birthPostalCode: 'birthPostalCode',
        birthINSEECode: 'birthINSEECode',
      });

      // when
      certificationCourse.correctBirthInformation({ birthCountry, birthCity, birthPostalCode, birthINSEECode });

      // then
      expect(certificationCourse.toDTO().birthCountry).to.equal(birthCountry);
      expect(certificationCourse.toDTO().birthplace).to.equal(birthCity);
      expect(certificationCourse.toDTO().birthPostalCode).to.equal(birthPostalCode);
      expect(certificationCourse.toDTO().birthINSEECode).to.equal(birthINSEECode);
    });
  });

  describe('#complete', () => {
    it('completes the certification course', () => {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        completedAt: null,
      });

      // when
      certificationCourse.complete({ now: new Date('1999-12-31') });

      // then
      expect(certificationCourse.toDTO().completedAt).to.deep.equal(new Date('1999-12-31'));
    });
  });
});
