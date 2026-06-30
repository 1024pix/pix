import { ModuleMetadata } from '../../../../../../src/devcomp/domain/models/module/ModuleMetadata.js';
import { moduleMetadataSerializer } from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/module-metadata-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | DevComp | Infrastructure | Serializers | Jsonapi | ModuleMetadataSerializer', function () {
  describe('#serialize', function () {
    it('should serialize', function () {
      // given
      const firstModuleMetadata = new ModuleMetadata({
        id: '5d7f6af1-5a56-4efd-9194-bf7c15384c09',
        shortId: 'bienecri',
        slug: 'slug',
        title: 'title',
        isBeta: false,
        duration: 10,
        image: 'https://example.net',
        visibility: 'public',
      });

      const secondModuleMetadata = new ModuleMetadata({
        id: '53b81e35-fe1d-4bca-9809-c7ef78efefca',
        shortId: 'bienecr2',
        slug: 'slug2',
        title: 'title2',
        isBeta: false,
        duration: 20,
        image: 'https://example.net',
        visibility: 'private',
      });

      const expectedJson = {
        data: [
          {
            type: 'module-metadatas',
            id: firstModuleMetadata.id,
            attributes: {
              'short-id': firstModuleMetadata.shortId,
              slug: firstModuleMetadata.slug,
              title: firstModuleMetadata.title,
              'is-beta': firstModuleMetadata.isBeta,
              duration: firstModuleMetadata.duration,
              image: firstModuleMetadata.image,
              link: `/modules/${firstModuleMetadata.shortId}/${firstModuleMetadata.slug}`,
              visibility: firstModuleMetadata.visibility,
            },
          },
          {
            type: 'module-metadatas',
            id: secondModuleMetadata.id,
            attributes: {
              'short-id': secondModuleMetadata.shortId,
              slug: secondModuleMetadata.slug,
              title: secondModuleMetadata.title,
              'is-beta': secondModuleMetadata.isBeta,
              duration: secondModuleMetadata.duration,
              image: secondModuleMetadata.image,
              link: `/modules/${secondModuleMetadata.shortId}/${secondModuleMetadata.slug}`,
              visibility: secondModuleMetadata.visibility,
            },
          },
        ],
      };

      // when
      const json = moduleMetadataSerializer.serialize([firstModuleMetadata, secondModuleMetadata]);

      // then
      expect(json).to.deep.equal(expectedJson);
    });
  });
});
