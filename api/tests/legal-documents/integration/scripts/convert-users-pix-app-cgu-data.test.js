import sinon from 'sinon';

import { LegalDocumentService } from '../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { ConvertUsersPixAppCguData } from '../../../../src/legal-documents/scripts/convert-users-pix-app-cgu-data.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

const { TOS } = LegalDocumentType.VALUES;
const { PIX_APP } = LegalDocumentService.VALUES;

describe('Integration | Legal documents | Scripts | convert-users-pix-app-cgu-data', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      // given
      const script = new ConvertUsersPixAppCguData();

      // when
      const { options, permanent } = script.metaInfo;

      // then
      expect(permanent).to.be.false;
      expect(options).to.deep.include({
        dryRun: {
          type: 'boolean',
          describe: 'Executes the script in dry run mode',
          default: false,
        },
        batchSize: {
          type: 'number',
          describe: 'Size of the batch to process',
          default: 1000,
        },
        throttleDelay: {
          type: 'number',
          describe: 'Delay between batches in milliseconds',
          default: 300,
        },
      });
    });
  });

  describe('#handle', function () {
    let clock;
    let legalDocumentVersion;
    let logger;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now: new Date('2024-01-01'), toFake: ['Date'] });
      legalDocumentVersion = databaseBuilder.factory.buildLegalDocumentVersion({ type: TOS, service: PIX_APP });
      logger = { info: sinon.stub() };
    });

    afterEach(async function () {
      clock.restore();
    });

    it('converts Pix App user cgus to legal document user acceptances', async function () {
      // given
      const userAcceptedCgu = databaseBuilder.factory.buildUser({
        cgu: true,
        lastTermsOfServiceValidatedAt: new Date('2021-01-01'),
      });
      const userAcceptedCguWithoutDate = databaseBuilder.factory.buildUser({
        cgu: true,
        lastTermsOfServiceValidatedAt: null,
      });
      const userNotAcceptedCgu = databaseBuilder.factory.buildUser({
        cgu: false,
        lastTermsOfServiceValidatedAt: null,
      });
      await databaseBuilder.commit();

      // when
      const script = new ConvertUsersPixAppCguData();
      const options = { dryRun: false, batchSize: 1, throttleDelay: 0 };
      await script.handle({ options, logger });

      // then
      expect(logger.info).to.have.been.calledWith('Batch #1: 1 users');
      expect(logger.info).to.have.been.calledWith('Batch #2: 1 users');
      expect(logger.info).to.have.been.calledWith('Total users migrated: 2');

      const userAcceptances = await knex('legal-document-version-user-acceptances').where({
        legalDocumentVersionId: legalDocumentVersion.id,
      });

      const acceptance1 = userAcceptances.find((user) => user.userId === userAcceptedCgu.id);
      expect(acceptance1.acceptedAt).to.deep.equal(new Date('2021-01-01'));

      const acceptance2 = userAcceptances.find((user) => user.userId === userAcceptedCguWithoutDate.id);
      expect(acceptance2.acceptedAt).to.deep.equal(new Date('2024-01-01'));

      const acceptance3 = userAcceptances.find((user) => user.userId === userNotAcceptedCgu.id);
      expect(acceptance3).to.be.undefined;
    });

    context('when a user cgu is already converted to legal document user acceptances', function () {
      it('does not change already converted user acceptances', async function () {
        // given
        const alreadyConvertedUser = databaseBuilder.factory.buildUser({
          cgu: true,
          lastTermsOfServiceValidatedAt: new Date('2021-01-01'),
        });
        const newUserAcceptedCgu = databaseBuilder.factory.buildUser({
          cgu: true,
          lastTermsOfServiceValidatedAt: new Date('2021-01-01'),
        });
        databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
          legalDocumentVersionId: legalDocumentVersion.id,
          userId: alreadyConvertedUser.id,
          acceptedAt: new Date('2020-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const script = new ConvertUsersPixAppCguData();
        const options = { dryRun: false, batchSize: 1, throttleDelay: 0 };
        await script.handle({ options, logger });

        // then
        expect(logger.info).to.have.been.calledWith('Total users migrated: 1');

        const userAcceptances = await knex('legal-document-version-user-acceptances').where({
          legalDocumentVersionId: legalDocumentVersion.id,
        });

        const acceptance1 = userAcceptances.find((user) => user.userId === alreadyConvertedUser.id);
        expect(acceptance1.acceptedAt).to.deep.equal(new Date('2020-01-01'));

        const acceptance2 = userAcceptances.find((user) => user.userId === newUserAcceptedCgu.id);
        expect(acceptance2.acceptedAt).to.deep.equal(new Date('2021-01-01'));
      });
    });

    context('when the script has the dry run mode', function () {
      it('does not create legal document user acceptance', async function () {
        // given
        databaseBuilder.factory.buildUser({
          cgu: true,
          lastTermsOfServiceValidatedAt: new Date('2021-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const script = new ConvertUsersPixAppCguData();
        const options = { dryRun: true, batchSize: 1, throttleDelay: 0 };
        await script.handle({ options, logger });

        // then
        expect(logger.info).to.have.been.calledWith('Batch #1: 1 users');
        expect(logger.info).to.have.been.calledWith('Total users to migrate: 1');

        const userAcceptances = await knex('legal-document-version-user-acceptances').where({
          legalDocumentVersionId: legalDocumentVersion.id,
        });
        expect(userAcceptances.length).to.equal(0);
      });
    });

    context('when a user has been anonymised', function () {
      it('does not migrate the anonymised user', async function () {
        // given
        databaseBuilder.factory.buildUser({
          cgu: true,
          hasBeenAnonymised: true,
          lastTermsOfServiceValidatedAt: new Date('2021-01-01'),
        });
        await databaseBuilder.commit();

        // when
        const script = new ConvertUsersPixAppCguData();
        const options = { dryRun: false, batchSize: 1, throttleDelay: 0 };
        await script.handle({ options, logger });

        // then
        expect(logger.info).to.have.been.calledWith('Total users migrated: 0');
      });
    });

    context('when no legal document is found', function () {
      it('throws an error', async function () {
        // given
        const script = new ConvertUsersPixAppCguData();

        // when / then
        const options = { dryRun: true, batchSize: 1, throttleDelay: 0 };
        await expect(script.handle({ options, logger })).to.be.rejectedWith(
          'No legal document found for type: TOS, service: pix-app',
        );
      });
    });
  });
});
