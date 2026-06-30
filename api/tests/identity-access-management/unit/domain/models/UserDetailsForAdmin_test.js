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
      context('when the user TOS statuses are ACCEPTED for pix app and pix orga', function () {
        it('returns the userDetailsForAdmin with accepted Pix App and Pix Orga TOS status', async function () {
          // given
          const user = domainBuilder.buildUser({
            cgu: false, // irrelevant data to enlighten the fact that values come now from tosStatus
            mustValidateTermsOfService: true, // irrelevant data to enlighten the fact that values come from tosStatus
            lastPixAppTermsOfServiceValidatedAt: null,
          });

          const pixAppTosAcceptedAt = new Date('2025-01-15');
          const pixOrgaTosAcceptedAt = new Date('2026-01-15');
          const userDetailsForAdmin = new UserDetailsForAdmin({
            userId: user.id,
          });
          const pixAppTosStatus = {
            status: STATUS.ACCEPTED,
            documentPath: '/tos/v2.pdf',
            acceptedAt: pixAppTosAcceptedAt,
          };
          const pixOrgaTosStatus = {
            status: STATUS.ACCEPTED,
            documentPath: '/tos/v4.pdf',
            acceptedAt: pixOrgaTosAcceptedAt,
          };

          // when
          userDetailsForAdmin.setTosStatus({ pixAppTosStatus, pixOrgaTosStatus });

          // then
          expect(userDetailsForAdmin.cgu).to.be.true;
          expect(userDetailsForAdmin.lastPixAppTermsOfServiceValidatedAt).to.deep.equal(pixAppTosAcceptedAt);
          expect(userDetailsForAdmin.lastPixOrgaTermsOfServiceValidatedAt).to.deep.equal(pixOrgaTosAcceptedAt);
          expect(userDetailsForAdmin.pixAppTermsOfServiceAccepted).to.equal(true);
          expect(userDetailsForAdmin.pixOrgaTermsOfServiceAccepted).to.equal(true);
        });
      });

      context('when the user TOS statuses are REQUESTED for Pix App and ACCEPTED for Pix Orga', function () {
        it('returns the user with not accepted Pix App TOS status and accepted Pix Orga TOS status', function () {
          // given
          const user = domainBuilder.buildUser({
            cgu: true, // irrelevant data to enlighten the fact that values come now from tosStatus
            mustValidateTermsOfService: false, // irrelevant data to enlighten the fact that values come from tosStatus
            lastPixAppTermsOfServiceValidatedAt: new Date('2025-01-15'), // irrelevant data to enlighten the fact that values come from tosStatus
          });
          const userDetailsForAdmin = new UserDetailsForAdmin({
            userId: user.id,
          });
          const pixOrgaTosAcceptedAt = new Date('2026-01-15');
          const pixAppTosStatus = { status: STATUS.REQUESTED, acceptedAt: null };
          const pixOrgaTosStatus = {
            status: STATUS.ACCEPTED,
            documentPath: '/tos/v4.pdf',
            acceptedAt: pixOrgaTosAcceptedAt,
          };

          // when
          userDetailsForAdmin.setTosStatus({ pixAppTosStatus, pixOrgaTosStatus });

          // then
          expect(userDetailsForAdmin.cgu).to.be.false;
          expect(userDetailsForAdmin.lastPixAppTermsOfServiceValidatedAt).to.be.null;
          expect(userDetailsForAdmin.pixAppTermsOfServiceAccepted).to.be.false;
        });
      });

      context('when the user TOS statuses for Pix App and Pix Orga are UPDATE-REQUESTED', function () {
        it('returns the user with update-requested Pix Orga and Pix App TOS statuses', function () {
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
          const pixOrgaTosStatus = { status: STATUS.UPDATE_REQUESTED, acceptedAt: null };

          // when
          userDetailsForAdmin.setTosStatus({ pixAppTosStatus, pixOrgaTosStatus });

          // then
          expect(userDetailsForAdmin.cgu).to.be.true;
          expect(userDetailsForAdmin.lastPixAppTermsOfServiceValidatedAt).to.be.null;
          expect(userDetailsForAdmin.lastPixOrgaTermsOfServiceValidatedAt).to.be.null;
          expect(userDetailsForAdmin.pixAppTermsOfServiceAccepted).to.be.false;
          expect(userDetailsForAdmin.pixOrgaTermsOfServiceAccepted).to.be.false;
        });
      });

      context('when the user Pix App TOS status is NOT-APPLICABLE', function () {
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
          const pixOrgaTosStatus = { status: STATUS.REQUESTED, acceptedAt: null };

          // when
          userDetailsForAdmin.setTosStatus({ pixAppTosStatus, pixOrgaTosStatus });

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
