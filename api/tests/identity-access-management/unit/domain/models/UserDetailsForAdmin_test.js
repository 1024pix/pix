import { UserDetailsForAdmin } from '../../../../../src/identity-access-management/domain/models/UserDetailsForAdmin.js';

describe('Unit | Domain | Models | UserDetailsForAdmin', function () {
  describe('constructor', function () {
    context('locale', function () {
      context('when there is no locale', function () {
        ['', null, undefined].forEach((locale) => {
          it(`returns null for ${locale}`, function () {
            // when
            const user = new UserDetailsForAdmin({ locale });

            //then
            expect(user.locale).to.be.undefined;
          });
        });
      });

      context('when the locale is not supported', function () {
        it('throws a RangeError', function () {
          // given
          const locale = 'fr-fr';

          // when
          const user = new UserDetailsForAdmin({ locale });

          //then
          expect(user.locale).to.equal('fr-FR');
        });
      });

      context('when the locale is supported', function () {
        ['fr', 'fr-FR', 'fr-BE'].forEach((locale) => {
          it(`returns the locale ${locale}`, function () {
            // when
            const user = new UserDetailsForAdmin({ locale });

            //then
            expect(user.locale).to.equal(locale);
          });
        });
      });
    });
  });

  describe('#anonymisedByFullName', function () {
    it('should return the full name of user who anonymised the user', function () {
      // given
      const user = new UserDetailsForAdmin({ anonymisedByFirstName: 'Sarah', anonymisedByLastName: 'Visseuse' });

      // when / then
      expect(user.anonymisedByFullName).equal('Sarah Visseuse');
    });

    it('should return null if user is not anonymised', function () {
      // given
      const user = new UserDetailsForAdmin({ anonymisedByFirstName: null, anonymisedByLastName: null });

      // when / then
      expect(user.anonymisedByFullName).to.be.null;
    });
  });
});
