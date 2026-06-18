import nock from 'nock';

import { PixAssetImageInfos } from '../../../../../src/shared/domain/models/PixAssetImageInfos.js';
import { getAssetInfos } from '../../../../../src/shared/infrastructure/repositories/pix-assets-repository.js';
import { expect } from '../../../../test-helper.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Infrastructure | Repository | PixAssets', function () {
  const fakeAnswerContent = {
    date: new Date('2025-09-12').toUTCString(),
    'content-type': 'image/svg+xml',
    'content-length': 4660,
    'x-request-id': 'e33deae7-a480-46af-886d-626adfa1dd43',
    vary: 'Accept-Encoding',
    'x-object-meta-optimized': 'true',
    'x-object-meta-uploader': 'yann.bertrand@pix.fr',
    'x-object-meta-comment': '',
    'x-object-meta-width': 140,
    'x-object-meta-height': 140,
    etag: '5d000d7075553ddcc08bedfcc34dc2ae',
    'last-modified': new Date('2025-09-11').toUTCString(),
    'x-timestamp': '1757611042.11464',
    'accept-ranges': 'bytes',
    'x-trans-id': 'tx44bf743653444a4d9e6aa-0068c41191',
    'x-openstack-request-id': 'tx44bf743653444a4d9e6aa-0068c41191',
    'x-iplb-request-id': '94FD60BE:9DF4_5762BBC9:01BB_68C41191_4BD0A3B5:4174',
    'x-iplb-instance': 54408,
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=172800',
    'strict-transport-security': 'max-age=31536000',
  };

  describe('#getAssetInfos', function () {
    context('when not from assets.pix.org', function () {
      it('should throw', async function () {
        // when
        const error = await catchErr(getAssetInfos)('https://images.pix.fr/modules/placeholder-details.svg');

        // then
        expect(error.message).to.equal(`Asset URL "images.pix.fr" hostname is not handled. Use "assets.pix.org"`);
      });
    });

    context('when assetsUrl is not a valid URL', function () {
      it('should throw an error', async function () {
        // when
        const assetUrl = 'this.is.not.a.valid.url';
        const error = await catchErr(getAssetInfos)(assetUrl);

        // then
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(`Asset URL "${assetUrl}" is invalid`);
      });
    });

    it('should call pix-assets for asset informations', async function () {
      // given
      const assetPath = '/modules/placeholder-details.svg';
      nock('https://assets.pix.org').head(assetPath).reply(200, '', fakeAnswerContent);

      const expectedResult = new PixAssetImageInfos({ width: 140, height: 140, contentType: 'image/svg+xml' });

      // when
      const result = await getAssetInfos('https://assets.pix.org/modules/placeholder-details.svg');

      // then
      expect(result).to.deep.equal(expectedResult);
    });

    it('should return empty object if no info found', async function () {
      const assetPath = '/modules/empty.svg';
      nock('https://assets.pix.org').head(assetPath).reply(200, {});

      // when
      const result = await getAssetInfos('https://assets.pix.org/modules/empty.svg');

      // then
      expect(result).to.deep.equal({});
    });
  });
});
