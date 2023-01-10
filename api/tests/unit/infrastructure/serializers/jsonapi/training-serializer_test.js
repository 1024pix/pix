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
            duration: { days: 3, hours: 3, minutes: 3 },
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
        duration: '3d3h3m',
        type: 'webinaire',
        editorLogoUrl: 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
        editorName: 'Ministère education nationale',
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { duration: {}, expectedDuration: '0d0h0m' },
      {
        duration: {
          days: 1,
          hours: 1,
          minutes: 1,
        },
        expectedDuration: '1d1h1m',
      },
    ].forEach(({ duration, expectedDuration }) => {
      it(`should deserialize ${JSON.stringify(
        duration
      )} with properly formatted duration : "${expectedDuration}"`, async function () {
        // given
        const jsonTraining = {
          data: {
            type: 'training',
            attributes: {
              title: 'title',
              link: 'https://example.net',
              duration,
              type: 'webinaire',
              locale: 'fr-fr',
              'editor-name': 'Ministère education nationale',
              'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
            },
          },
        };

        // when
        const deserializedTraining = await serializer.deserialize(jsonTraining);

        // then
        expect(deserializedTraining.duration).to.deep.equal(expectedDuration);
      });
    });
  });
});
