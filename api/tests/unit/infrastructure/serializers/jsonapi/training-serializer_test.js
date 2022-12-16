const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/training-serializer');

describe('Unit | Serializer | JSONAPI | training-serializer', function () {
  describe('#serialize', function () {
    it('should convert a training model to JSON', function () {
      // given
      const training = domainBuilder.buildTraining();

      const expectedSerializedTraining = {
        data: {
          attributes: {
            title: 'Training 1',
            link: 'https://example.net',
            type: 'webinar',
            duration: {
              hours: 5,
            },
            locale: 'fr-fr',
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
          },
          id: training.id.toString(),
          type: 'trainings',
        },
      };

      // when
      const json = serializer.serialize(training);

      // then
      expect(json).to.deep.equal(expectedSerializedTraining);
    });

    it('should serialize trainings with pagination', function () {
      // given
      const training = domainBuilder.buildTraining();
      const meta = {
        pagination: {
          page: 1,
          pageSize: 10,
          rowCount: 1,
          pageCount: 1,
        },
      };
      const expectedSerializedTraining = {
        data: {
          attributes: {
            title: 'Training 1',
            link: 'https://example.net',
            type: 'webinar',
            duration: {
              hours: 5,
            },
            locale: 'fr-fr',
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
          },
          id: training.id.toString(),
          type: 'trainings',
        },
        meta,
      };

      // when
      const json = serializer.serialize(training, meta);

      // then
      expect(json).to.deep.equal(expectedSerializedTraining);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data to Training object', async function () {
      // given
      const jsonTraining = {
        data: {
          type: 'training',
          attributes: {
            title: 'title',
            link: 'https://example.net',
            duration: '6h',
            type: 'webinaire',
            locale: 'fr-fr',
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
          },
        },
      };

      // when
      const training = await serializer.deserialize(jsonTraining);

      // then
      expect(training).to.deep.equal({
        title: 'title',
        link: 'https://example.net',
        locale: 'fr-fr',
        duration: '6h',
        type: 'webinaire',
        editorLogoUrl: 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
        editorName: 'Ministère education nationale',
      });
    });
  });
});
