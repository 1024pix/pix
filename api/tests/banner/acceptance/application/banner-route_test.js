import { informationBannersStorage } from '../../../../src/shared/infrastructure/key-value-storages/index.js';
import { server } from '../../../tooling/servers.js';

describe('Acceptance | Router | banner-route', function () {
  describe('GET /api/information-banners/{target}', function () {
    context('when no banners have been stored for given target', function () {
      it('should return empty banners', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/information-banners/pix-target',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: {
            type: 'information-banners',
            id: 'pix-target',
            attributes: {},
            relationships: { banners: { data: [] } },
          },
        });
      });
    });

    context('when a banner has been stored for given target', function () {
      it('should return the stored banner', async function () {
        // given
        const target = 'pix-target';
        const bannerData = { message: '[fr]Texte de la bannière[/fr][en]Banner text[/en]', severity: 'info' };

        await informationBannersStorage.save({ key: target, value: [bannerData], expirationDelaySeconds: 10 });
        const options = {
          method: 'GET',
          url: '/api/information-banners/pix-target',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: {
            type: 'information-banners',
            id: 'pix-target',
            attributes: {},
            relationships: {
              banners: {
                data: [{ id: 'pix-target:1', type: 'banners' }],
              },
            },
          },
          included: [
            {
              attributes: {
                message: '[fr]Texte de la bannière[/fr][en]Banner text[/en]',
                severity: 'info',
              },
              id: 'pix-target:1',
              type: 'banners',
            },
          ],
        });
      });
    });
  });
});
