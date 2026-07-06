import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Serializer | combined-course-blueprint', function (hooks) {
  setupTest(hooks);

  test('it serializes records for creation', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('combined-course-blueprint', {
      name: 'parcours',
      internalName: 'Nom interne',
      content: [
        {
          type: 'evaluation',
          value: 1,
          label: 'Profil cilble 1',
        },
      ],
      attestationLabel: 'Label attestation',
      rewardId: 5,
      rewardType: 'ATTESTATION',
      surveyLink: 'http://survey-link-test.fr',
      cappedTubeRequirements: [
        {
          threshold: 0.5,
          tubes: [
            {
              tubeId: '123',
              level: 1,
            },
          ],
        },
      ],
    });

    const serializedRecord = record.serialize();

    assert.deepEqual(
      {
        data: {
          type: 'combined-course-blueprints',
          attributes: {
            name: 'parcours',
            'internal-name': 'Nom interne',
            'created-at': undefined,
            illustration: null,
            description: null,
            content: [
              {
                type: 'evaluation',
                value: 1,
              },
            ],
            'capped-tube-requirements': [
              {
                threshold: 0.5,
                tubes: [
                  {
                    tubeId: '123',
                    level: 1,
                  },
                ],
              },
            ],
            'reward-id': 5,
            'reward-type': 'ATTESTATION',
            'reward-requirements': null,
            'survey-link': 'http://survey-link-test.fr',
          },
        },
      },
      serializedRecord,
    );
  });
  test('it serializes records for update', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('combined-course-blueprint', {
      id: '1',
      name: 'parcours',
      internalName: 'Nom interne',
      content: [
        {
          type: 'evaluation',
          value: 1,
          label: 'Profil cilble 1',
        },
      ],
      attestationLabel: 'Label attestation',
      rewardId: 5,
      rewardType: 'ATTESTATION',
      surveyLink: 'http://survey-link-test.fr',
      'capped-tube-requirements': [
        {
          threshold: 0.5,
          tubes: [
            {
              tubeId: '123',
              level: 1,
            },
          ],
        },
      ],
    });

    const serializedRecord = record.serialize();

    assert.deepEqual(serializedRecord, {
      data: {
        type: 'combined-course-blueprints',
        attributes: {
          name: 'parcours',
          'internal-name': 'Nom interne',
          illustration: null,
          description: null,
          'survey-link': 'http://survey-link-test.fr',
          'reward-requirements': null,
        },
      },
    });
  });
});
