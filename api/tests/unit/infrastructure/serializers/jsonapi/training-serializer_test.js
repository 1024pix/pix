const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/training-serializer');

describe('Unit | Serializer | JSONAPI | training-serializer', function () {
  describe('#serializeForAdmin', function () {
    it('should convert a training model to JSON', function () {
      // given
      const trainingId = 123;
      const skills = [domainBuilder.buildSkill({ id: 'skill_1', name: '@web1' })];
      const tube = domainBuilder.buildTube({ id: 'tube_1', name: 'Tube 1', skills });
      const triggerTubes = [domainBuilder.buildTrainingTriggerTube({ trainingId: 123, tube })];
      const triggers = [domainBuilder.buildTrainingTrigger({ trainingId: 123, triggerTubes })];
      const training = domainBuilder.buildTraining({ id: trainingId, triggers });

      const expectedSerializedTraining = {
        data: {
          attributes: {
            duration: {
              days: 0,
              hours: 5,
              minutes: 0,
            },
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
            'editor-name': 'Ministère education nationale',
            link: 'https://example.net',
            locale: 'fr-fr',
            title: 'Training 1',
            type: 'webinar',
          },
          id: '123',
          relationships: {
            'target-profile-summaries': {
              links: {
                related: '/api/admin/trainings/123/target-profile-summaries',
              },
            },
            triggers: {
              data: [
                {
                  id: '1000',
                  type: 'triggers',
                },
              ],
            },
          },
          type: 'trainings',
        },
        included: [
          {
            attributes: {
              name: tube.name,
              'practical-title': tube.practicalTitle,
              skills: [
                {
                  competenceId: skills[0].competenceId,
                  difficulty: skills[0].difficulty,
                  id: skills[0].id,
                  learningMoreTutorialIds: [],
                  name: skills[0].name,
                  pixValue: skills[0].pixValue,
                  tubeId: skills[0].tubeId,
                  tutorialIds: skills[0].tutorialIds,
                  version: skills[0].version,
                },
              ],
            },
            id: tube.id,
            type: 'tubes',
          },
          {
            attributes: {
              level: triggerTubes[0].level,
            },
            id: `${triggerTubes[0].id}`,
            relationships: {
              tube: {
                data: {
                  id: tube.id,
                  type: 'tubes',
                },
              },
            },
            type: 'trigger-tubes',
          },
          {
            attributes: {
              threshold: triggers[0].threshold,
              type: triggers[0].type,
            },
            id: '1000',
            relationships: {
              'trigger-tubes': {
                data: [
                  {
                    id: '1000',
                    type: 'trigger-tubes',
                  },
                ],
              },
            },
            type: 'triggers',
          },
        ],
      };

      // when
      const json = serializer.serializeForAdmin(training);

      // then
      expect(json).to.deep.equal(expectedSerializedTraining);
    });
  });

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
              days: 0,
              hours: 5,
              minutes: 0,
            },
            locale: 'fr-fr',
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
          },
          relationships: {
            'target-profile-summaries': {
              links: {
                related: `/api/admin/trainings/${training.id}/target-profile-summaries`,
              },
            },
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
              days: 0,
              hours: 5,
              minutes: 0,
            },
            locale: 'fr-fr',
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
          },
          relationships: {
            'target-profile-summaries': {
              links: {
                related: `/api/admin/trainings/${training.id}/target-profile-summaries`,
              },
            },
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
      { duration: { days: 0, hours: 0, minutes: 0 }, expectedDuration: '0d0h0m' },
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
