import { expect } from 'chai';

import { UserDetailsForAdmin } from '../../../../../src/deprecated/domain/models/UserDetailsForAdmin.js';
import { usecases } from '../../../../../src/deprecated/domain/usecases/index.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Deprecated | Domain | UseCase | get-user-details-for-admin', function () {
  describe('#getUserDetailsForAdmin', function () {
    it('returns the found user', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });

      // then
      expect(userDetailsForAdmin).to.be.an.instanceOf(UserDetailsForAdmin);
      expect(userDetailsForAdmin.id).to.equal(userId);
    });

    context('when feature toggle newPixCertifLegalDocumentsVersioning is enabled', function () {
      beforeEach(async function () {
        await featureToggles.set('newPixCertifLegalDocumentsVersioning', true);
      });

      context('when user has accepted pix-certif-tos', function () {
        it('returns the user with accepted Pix Certif TOS status', async function () {
          // given
          const acceptedAt = new Date('2024-06-02');
          const userId = databaseBuilder.factory.buildUser({
            pixCertifTermsOfServiceAccepted: false, // irrelevant data to enlighten the fact that values come now from legalDocumentVersionUserAcceptances table
            lastPixCertifTermsOfServiceValidatedAt: null, // irrelevant data to enlighten the fact that values come now from legalDocumentVersionUserAcceptances table
          }).id;
          const documentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
            service: 'pix-certif',
            type: 'TOS',
            versionAt: new Date('2024-06-01'),
          });
          databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
            userId,
            legalDocumentVersionId: documentVersion.id,
            acceptedAt,
          });
          await databaseBuilder.commit();

          // when
          const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });

          // then
          expect(userDetailsForAdmin.pixCertifTermsOfServiceAccepted).to.be.true;
          expect(userDetailsForAdmin.lastPixCertifTermsOfServiceValidatedAt).to.deep.equal(acceptedAt);
        });
      });

      context('when user has never accepted pix-certif-tos', function () {
        it('returns the user with not accepted Pix Certif TOS status', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser({
            pixCertifTermsOfServiceAccepted: true, // irrelevant data to enlighten the fact that values come now from legalDocumentVersionUserAcceptances table
            lastPixCertifTermsOfServiceValidatedAt: new Date('2024-06-02'), // irrelevant data to enlighten the fact that values come now from legalDocumentVersionUserAcceptances table
          }).id;
          databaseBuilder.factory.buildLegalDocumentVersion({
            service: 'pix-certif',
            type: 'TOS',
            versionAt: new Date('2024-06-01'),
          });
          await databaseBuilder.commit();

          // when
          const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });

          // then
          expect(userDetailsForAdmin.pixCertifTermsOfServiceAccepted).to.be.false;
          expect(userDetailsForAdmin.lastPixCertifTermsOfServiceValidatedAt).to.be.null;
        });
      });
    });

    context('when feature toggle newPixCertifLegalDocumentsVersioning is not enabled', function () {
      beforeEach(async function () {
        await featureToggles.set('newPixCertifLegalDocumentsVersioning', false);
      });

      it('returns the user with legacy Pix Certif TOS status', async function () {
        // given
        const acceptedAt = new Date('2024-06-02');
        const userId = databaseBuilder.factory.buildUser({
          pixCertifTermsOfServiceAccepted: true,
          lastPixCertifTermsOfServiceValidatedAt: acceptedAt,
        }).id;
        await databaseBuilder.commit();

        // when
        const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });

        // then
        expect(userDetailsForAdmin.pixCertifTermsOfServiceAccepted).to.be.true;
        expect(userDetailsForAdmin.lastPixCertifTermsOfServiceValidatedAt).to.deep.equal(acceptedAt);
      });
    });

    context('when no user is found', function () {
      it('throws a UserNotFoundError', async function () {
        // given
        const nonExistentUserId = 678;

        // when & then
        await expect(usecases.getUserDetailsForAdmin({ userId: nonExistentUserId })).to.be.rejectedWith(
          UserNotFoundError,
        );
      });
    });
  });
});
