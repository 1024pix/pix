import { Center } from '../../../../../../src/certification/configuration/domain/models/Center.js';
import { CenterTypes } from '../../../../../../src/certification/configuration/domain/models/CenterTypes.js';
import { config } from '../../../../../../src/shared/config.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Configuration | Domain | Models | Center', function () {
  it('should build a Center', function () {
    // given
    // when
    const center = new Center({
      id: 12,
      type: CenterTypes.PRO,
      externalId: 'hello',
    });

    // then
    expect(center).to.deep.equal({
      id: 12,
      type: CenterTypes.PRO,
      externalId: 'hello',
    });
  });

  context('class invariants', function () {
    it('should not allow Center without type', function () {
      // given
      // when
      const error = catchErrSync(() => new Center({}))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });
  });

  context('#isInWhitelist', function () {
    let originalEnvValueWhitelist;

    beforeEach(function () {
      originalEnvValueWhitelist = config.features.pixCertifScoBlockedAccessWhitelist;
      config.features.pixCertifScoBlockedAccessWhitelist = [];
    });

    afterEach(function () {
      config.features.pixCertifScoBlockedAccessWhitelist = originalEnvValueWhitelist;
    });

    it('should consider centers other than SCO as always whitelisted', function () {
      // given
      config.features.pixCertifScoBlockedAccessWhitelist = ['hello'];
      const center = new Center({
        id: 12,
        type: CenterTypes.PRO,
        externalId: 'hello',
      });
      // when
      const isInWhitelist = center.isInWhitelist();

      // then
      expect(isInWhitelist).to.be.true;
    });
    context('when center is SCO', function () {
      it('should consider blank externalId as not whitelisted', function () {
        // given
        const center = new Center({
          id: 12,
          type: CenterTypes.SCO,
          externalId: '  ',
        });
        // when
        const isInWhitelist = center.isInWhitelist();

        // then
        expect(isInWhitelist).to.be.false;
      });

      it('should consider center without externalId as not whitelisted', function () {
        // given
        const center = new Center({
          id: 12,
          type: CenterTypes.SCO,
          externalId: undefined,
        });
        // when
        const isInWhitelist = center.isInWhitelist();

        // then
        expect(isInWhitelist).to.be.false;
      });

      it('should consider center in whitelist as whitelisted', function () {
        // given
        const externalId = 'WHITELISTED';
        config.features.pixCertifScoBlockedAccessWhitelist = [externalId];
        const center = new Center({
          id: 12,
          type: CenterTypes.SCO,
          externalId: externalId,
        });
        // when
        const isInWhitelist = center.isInWhitelist();

        // then
        expect(isInWhitelist).to.be.true;
      });

      it('should consider center NOT in whitelist as NOT whitelisted', function () {
        // given
        config.features.pixCertifScoBlockedAccessWhitelist = ['WHITELISTED'];
        const center = new Center({
          id: 12,
          type: CenterTypes.SCO,
          externalId: 'not_whitelisted',
        });
        // when
        const isInWhitelist = center.isInWhitelist();

        // then
        expect(isInWhitelist).to.be.false;
      });

      it('should not be case sensitive on externalId', function () {
        // given
        // config is already uppercased + trimmed
        config.features.pixCertifScoBlockedAccessWhitelist = ['WHITELISTED12'];
        const center = new Center({
          id: 12,
          type: CenterTypes.SCO,
          externalId: 'whiteLISTed12',
        });
        // when
        const isInWhitelist = center.isInWhitelist();

        // then
        expect(isInWhitelist).to.be.true;
      });
    });
  });
});
