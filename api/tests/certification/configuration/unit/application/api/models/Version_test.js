import { FRAMEWORK_HISTORY_STATUSES } from '../../../../../../../src/certification/configuration/domain/read-models/FrameworkHistoryEntry.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Application | Api | Models | Version', function () {
  describe('#constructor', function () {
    context('when the version has an expiration date', function () {
      it('builds an archived version', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          expirationDate: new Date('2025-02-02'),
        });

        expect(version.status).to.equal(FRAMEWORK_HISTORY_STATUSES.ARCHIVED);
      });
    });

    context('when the version has no expiration date but only a start date', function () {
      it('builds an active version', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          startDate: new Date('2025-02-02'),
          expirationDate: null,
        });

        expect(version.status).to.equal(FRAMEWORK_HISTORY_STATUSES.ACTIVE);
      });
    });

    context('when the version has no expiration date nor start date', function () {
      it('builds a draft version', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          startDate: null,
          expirationDate: null,
        });

        expect(version.status).to.equal(FRAMEWORK_HISTORY_STATUSES.DRAFT);
      });
    });
  });

  describe('#isDraft', function () {
    context('when the version is archived', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          expirationDate: new Date('2025-02-02'),
        });

        expect(version.isDraft).to.be.false;
      });
    });

    context('when the version is active', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          startDate: new Date('2025-02-02'),
          expirationDate: null,
        });

        expect(version.isDraft).to.be.false;
      });
    });

    context('when the version is draft', function () {
      it('return true', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          startDate: null,
          expirationDate: null,
        });

        expect(version.isDraft).to.be.true;
      });
    });
  });

  describe('#isActive', function () {
    context('when the version is archived', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          expirationDate: new Date('2025-02-02'),
        });

        expect(version.isActive).to.be.false;
      });
    });

    context('when the version is active', function () {
      it('return true', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          startDate: new Date('2025-02-02'),
          expirationDate: null,
        });

        expect(version.isActive).to.be.true;
      });
    });

    context('when the version is draft', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          startDate: null,
          expirationDate: null,
        });

        expect(version.isActive).to.be.false;
      });
    });
  });
});
