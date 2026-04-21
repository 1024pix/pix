import { checkDisplayCatalogueIsEnabled } from '../../../../../src/quest/application/pre-handlers/display-catalogue.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';

import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Quest | Unit | Application | PreHandlers', function () {
  describe('#checkDisplayCatalogueIsEnabled', function () {
    context('when feature toggle is enabled', function () {
      it('should authorize access', async function () {
        await featureToggles.set('displayCatalogue', true);

        const response = await checkDisplayCatalogueIsEnabled({}, hFake);

        expect(response.source).to.be.true;
      });
    });

    context('when feature toggle is disabled', function () {
      it('should not authorize access and return 404', async function () {
        await featureToggles.set('displayCatalogue', false);

        const response = await checkDisplayCatalogueIsEnabled({}, hFake);

        expect(response.statusCode).to.equal(404);
        expect(response.source).to.deep.equal({
          errors: [{ status: '404', title: 'Not Found' }],
        });
      });
    });
  });
});
