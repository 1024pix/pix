import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import { module, test } from 'qunit';
import { startMirage } from 'your-ember-project-name/initializers/ember-cli-mirage';
import * as path from 'path';

module('Pact with Mirage Provider', function (hooks) {
  let server;
  let adapter;

  hooks.beforeEach(function () {
    server = startMirage();
    adapter = this.owner.lookup('adapter:training');
  });

  hooks.afterEach(function () {
    server.shutdown();
  });

  const provider = new PactV3({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'mon-pix',
    provider: 'api',
  });

  hooks.before(() => provider.setup());

  hooks.after(() => provider.finalize());

  test('should fulfill the contract', async function (assert) {
    // Define your Mirage endpoint
    server.get('/api/users/1/trainings', () => {
      return {
        data: {
          duration: {
            hours: 6,
            days: 0,
            minutes: 0,
          },
          link: 'http://mon-link.com',
          locale: 'fr-fr',
          title: 'Apprendre à peindre comme Monet',
          type: 'webinaire',
          'editor-name': "Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
          'editor-logo-url':
            'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
        },
      };
    });

    const trainingExamplePayload = {
      duration: {
        hours: 6,
        days: 0,
        minutes: 0,
      },
      link: 'http://mon-link.com',
      locale: 'fr-fr',
      title: 'Apprendre à peindre comme Monet',
      type: 'webinaire',
      'editor-name': "Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
      'editor-logo-url':
        'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
    };

    const EXPECTED_BODY = MatchersV3.eachLike(trainingExamplePayload);

    // Define the Pact interaction
    await provider.addInteraction({
      state: 'I have a list of trainings available',
      uponReceiving: 'a request for all trainings available to the user to be returned',
      withRequest: {
        method: 'GET',
        path: '/api/users/1/trainings',
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: EXPECTED_BODY,
      },
    });

    // Make the actual request using your Ember consumer function
    const status = 200;
    const headers = { 'Content-Type': 'application/json' };
    const payload = EXPECTED_BODY;
    const requestData = {};

    // when
    const result = await adapter.handleResponse(status, headers, payload, requestData);

    // Assert that the response matches the expected contract
    assert.deepEqual(result.payload, EXPECTED_BODY);

    // Verify the interaction with the Pact server
    await provider.verify();
  });
});
