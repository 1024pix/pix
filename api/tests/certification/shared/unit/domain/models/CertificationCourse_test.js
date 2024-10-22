import { AlgoritmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgoritmEngineVersion.js';
import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import * as languageService from '../../../../../../src/shared/domain/services/language-service.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';
import { generateChallengeList } from '../../../fixtures/challenges.js';

describe('Unit | Domain | Models | CertificationCourse', function () {
  describe('#cancel #isCancelled', function () {
    it('should cancel a certification course', function () {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        isCancelled: false,
      });

      // when
      certificationCourse.cancel();

      // then
      expect(certificationCourse.toDTO().isCancelled).to.be.true;
    });

    describe('when certification course is already cancelled', function () {
      it('should not change isCancelled value', function () {
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

  describe('#cancel #uncancelled', function () {
    it('should uncancel a certification course', function () {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        isCancelled: true,
      });

      // when
      certificationCourse.uncancel();

      // then
      expect(certificationCourse.toDTO().isCancelled).to.be.false;
    });

    describe('when certification course is not cancelled', function () {
      it('should not change isCancelled value', function () {
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

  describe('#abort', function () {
    it('should abort a certification course', function () {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        abortReason: null,
      });

      // when
      certificationCourse.abort('technical');

      // then
      expect(certificationCourse.toDTO().abortReason).to.equal('technical');
    });

    it('should fail if abort reason is unknown', async function () {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        abortReason: null,
      });

      // then
      expect(() => {
        certificationCourse.abort('some random stuff');
      }).to.throw(EntityValidationError);
    });
  });

  describe('#unabort', function () {
    it('should unabort a certification course', function () {
      // given
      const certificationCourse = domainBuilder.buildCertificationCourse({
        abortReason: 'technical',
      });

      // when
      certificationCourse.unabort();

      // then
      expect(certificationCourse.toDTO().abortReason).to.be.null;
    });
  });

  describe('#correctBirthdate', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    ['2000-13-01', null, undefined, '', 'invalid'].forEach((invalidDate) => {
      it(`throws if date is invalid : ${invalidDate}`, function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse();

        // when / then
        expect(() => {
          certificationCourse.correctBirthdate(invalidDate);
        }).to.throw(EntityValidationError);
      });
    });

    it('modifies the birthdate', function () {
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

  describe('#correctFirstName', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [null, undefined, '', '   '].forEach((invalidFirstName) => {
      it(`throws if first name is invalid : ${invalidFirstName}`, function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse();

        // when / then
        expect(() => {
          certificationCourse.correctFirstName(invalidFirstName);
        }).to.throw(EntityValidationError);
      });
    });

    it('collapses white spaces and modifies the first name', function () {
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

  describe('#correctLastName', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [null, undefined, '', '   '].forEach((invalidLastName) => {
      it(`throws if last name is invalid : ${invalidLastName}`, function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse();

        // when / then
        expect(() => {
          certificationCourse.correctLastName(invalidLastName);
        }).to.throw(EntityValidationError);
      });
    });

    it('collapses white spaces and modifies the last name', function () {
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

  describe('#correctBirthplace', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [null, undefined, '', '   '].forEach((invalidBirthPlace) => {
      it(`does not modify if birthplace is invalid : ${invalidBirthPlace}`, function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          birthplace: 'some place',
        });

        // when
        certificationCourse.correctBirthplace(invalidBirthPlace);

        // then
        expect(certificationCourse.toDTO().birthplace).to.equal('some place');
      });

      it(`does not throw if birthplace is invalid : ${invalidBirthPlace}`, function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse();

        // when / then
        expect(() => {
          certificationCourse.correctBirthplace(invalidBirthPlace);
        }).not.to.throw();
      });
    });

    it('collapses white spaces and modifies the birthplace', function () {
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

  describe('#correctSex', function () {
    it('throws if sex is neither M nor F', function () {
      // given
      const invalidSex = 'invalid_sex';
      const certificationCourse = domainBuilder.buildCertificationCourse({
        sex: 'M',
      });

      // then
      expect(() => certificationCourse.correctSex(invalidSex)).to.throw(EntityValidationError);
    });

    it('not throw if sex is not defined', function () {
      // given
      const sex = null;
      const certificationCourse = domainBuilder.buildCertificationCourse({
        sex: 'M',
      });

      // then
      expect(() => certificationCourse.correctSex(sex)).not.to.throw(EntityValidationError);
    });

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    ['M', 'F'].forEach((validSex) => {
      it(`modifies the sex when value is ${validSex}`, function () {
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

  describe('#correctBirthInformation', function () {
    it('should set birth information to certification course', function () {
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

  describe('#complete', function () {
    it('completes the certification course', function () {
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

  describe('#getNumberOfChallenges', function () {
    describe('when certification course is version 3', function () {
      it('should return the number of challenges defined when created', function () {
        // given
        const numberOfChallenges = 5;
        const certificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgoritmEngineVersion.V3,
          numberOfChallenges,
        });

        // when
        const computedNumberOfChallenges = certificationCourse.getNumberOfChallenges();

        // then
        expect(computedNumberOfChallenges).to.equal(numberOfChallenges);
      });
    });

    describe('when certification course is version 2', function () {
      it('should return the number of challenges based on the challenges length', function () {
        // given
        const numberOfChallenges = 5;
        const challenges = generateChallengeList({ length: numberOfChallenges });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          version: AlgoritmEngineVersion.V2,
          challenges,
        });

        // when
        const computedNumberOfChallenges = certificationCourse.getNumberOfChallenges();

        // then
        expect(computedNumberOfChallenges).to.equal(numberOfChallenges);
      });
    });
  });

  describe('#isLanguageAvailableForV3Certification', function () {
    it('should be true if user language is available for certification', function () {
      // given
      const user = domainBuilder.buildUser({
        lang: 'en',
      });

      // when
      const isAvailable = CertificationCourse.isLanguageAvailableForV3Certification(languageService, user.lang);

      //then
      expect(isAvailable).to.be.true;
    });

    it('should be false if user language is NOT available for certification', function () {
      // given
      const user = domainBuilder.buildUser({
        lang: 'nl',
      });

      // when
      const isAvailable = CertificationCourse.isLanguageAvailableForV3Certification(languageService, user.lang);

      //then
      expect(isAvailable).to.be.false;
    });
  });

  describe('#adjustForAccessibility', function () {
    describe('when an adjustment is needed', function () {
      it('sets the certification adjustment property to true', function () {
        // given
        const certificationCourse = new CertificationCourse();
        const isAdjustmentNeeded = true;

        // when
        certificationCourse.adjustForAccessibility(isAdjustmentNeeded);

        // then
        expect(certificationCourse.isAdjustementNeeded()).to.be.true;
      });
    });

    describe('when an adjustment is not needed', function () {
      it('sets the certification adjustment property to false', function () {
        // given
        const certificationCourse = new CertificationCourse();
        const isAdjustmentNeeded = false;

        // when
        certificationCourse.adjustForAccessibility(isAdjustmentNeeded);

        // then
        expect(certificationCourse.isAdjustementNeeded()).to.be.false;
      });
    });
  });
});
