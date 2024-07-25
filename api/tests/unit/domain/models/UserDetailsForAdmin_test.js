import { UserDetailsForAdmin } from '../../../../src/shared/domain/models/UserDetailsForAdmin.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Models | UserDetailsForAdmin', function () {
  let localeService;
  let dependencies;

  beforeEach(function () {
    localeService = {
      getCanonicalLocale: sinon.stub(),
    };
    dependencies = { localeService };
  });

  describe('constructor', function () {
    it('accepts no locale', function () {
      // given
      const users = [
        new UserDetailsForAdmin({ locale: '' }, dependencies),
        new UserDetailsForAdmin({ locale: null }, dependencies),
        new UserDetailsForAdmin({ locale: undefined }, dependencies),
      ];

      //then
      expect(users.length).to.equal(3);
    });

    it('validates and canonicalizes the locale', function () {
      // given
      localeService.getCanonicalLocale.returns('fr-BE');

      // when
      const user = new UserDetailsForAdmin({ locale: 'fr-be' }, dependencies);

      // then
      expect(localeService.getCanonicalLocale).to.have.been.calledWithExactly('fr-be');
      expect(user.locale).to.equal('fr-BE');
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
