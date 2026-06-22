import { UserDetailsForAdmin } from '../../../../../src/identity-access-management/domain/models/UserDetailsForAdmin.js';
import { STATUS } from '../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

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

    context('terms of service', function () {
      context('when the user TOS status is ACCEPTED', function () {
        it('returns the userDetailsForAdmin with accepted Pix App TOS status', async function () {
          // given
          const user = domainBuilder.buildUser({
            cgu: false, // irrelevant data to enlighten the fact that values come now from tosStatus
            mustValidateTermsOfService: true, // irrelevant data to enlighten the fact that values come from tosStatus
            lastPixAppTermsOfServiceValidatedAt: null,
          });

          const acceptedAt = new Date('2025-01-15');
          const userDetailsForAdmin = new UserDetailsForAdmin({
            userId: user.id,
          });
          const pixAppTosStatus = { status: STATUS.ACCEPTED, documentPath: '/tos/v2.pdf', acceptedAt: acceptedAt };

          // when
          userDetailsForAdmin.tosStatus = { pixAppTosStatus };

          // then
          expect(userDetailsForAdmin.cgu).to.be.true;
          expect(userDetailsForAdmin.lastPixAppTermsOfServiceValidatedAt).to.deep.equal(acceptedAt);
          expect(userDetailsForAdmin.pixAppTermsOfServiceAccepted).to.equal(true);
        });
      });

      context('when the user TOS status is REQUESTED', function () {
        it('returns the user with not accepted Pix App TOS status', function () {
          // given
          const user = domainBuilder.buildUser({
            cgu: true, // irrelevant data to enlighten the fact that values come now from tosStatus
            mustValidateTermsOfService: false, // irrelevant data to enlighten the fact that values come from tosStatus
            lastPixAppTermsOfServiceValidatedAt: new Date('2025-01-15'), // irrelevant data to enlighten the fact that values come from tosStatus
          });
          const userDetailsForAdmin = new UserDetailsForAdmin({
            userId: user.id,
          });
          const pixAppTosStatus = { status: STATUS.REQUESTED, acceptedAt: null };

          // when
          userDetailsForAdmin.tosStatus = { pixAppTosStatus };

          // then
          expect(userDetailsForAdmin.cgu).to.be.false;
          expect(userDetailsForAdmin.lastPixAppTermsOfServiceValidatedAt).to.be.null;
          expect(userDetailsForAdmin.pixAppTermsOfServiceAccepted).to.be.false;
        });
      });

      context('when the user TOS status is UPDATE-REQUESTED', function () {
        it('returns the user with update-requested TOS status', function () {
          // given
          const user = domainBuilder.buildUser({
            cgu: false, // irrelevant data to enlighten the fact that values come now from tosStatus
            mustValidateTermsOfService: false, // irrelevant data to enlighten the fact that values come from tosStatus
            lastPixAppTermsOfServiceValidatedAt: new Date('2020-01-15'),
          });
          const userDetailsForAdmin = new UserDetailsForAdmin({
            userId: user.id,
          });
          const pixAppTosStatus = { status: STATUS.UPDATE_REQUESTED, acceptedAt: null };

          // when
          userDetailsForAdmin.tosStatus = { pixAppTosStatus };

          // then
          expect(userDetailsForAdmin.cgu).to.be.true;
          expect(userDetailsForAdmin.lastPixAppTermsOfServiceValidatedAt).to.be.null;
          expect(userDetailsForAdmin.pixAppTermsOfServiceAccepted).to.be.false;
        });
      });

      context('when the user TOS status is NOT-APPLICABLE', function () {
        it('returns the user with update-requested TOS status', function () {
          // given
          const user = domainBuilder.buildUser({
            cgu: true, // irrelevant data to enlighten the fact that values come now from tosStatus
            mustValidateTermsOfService: false, // irrelevant data to enlighten the fact that values come from tosStatus
            lastPixAppTermsOfServiceValidatedAt: new Date('2020-01-15'), // irrelevant data to enlighten the fact that values come from tosStatus
          });
          const userDetailsForAdmin = new UserDetailsForAdmin({
            userId: user.id,
          });
          const pixAppTosStatus = { status: STATUS.NOT_APPLICABLE, acceptedAt: null };

          // when
          userDetailsForAdmin.tosStatus = { pixAppTosStatus };

          // then
          expect(userDetailsForAdmin.cgu).to.be.false;
          expect(userDetailsForAdmin.lastPixAppTermsOfServiceValidatedAt).to.be.null;
          expect(userDetailsForAdmin.pixAppTermsOfServiceAccepted).to.be.false;
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
