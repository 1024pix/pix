import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';
import authenticateSession from '../helpers/authenticate-session';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | preselect-target-profile', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);
    await authenticateSession(user.id);
  });

  test('it should display tubes', async function (assert) {
    // given
    server.create('tube', { id: 'recTube1', name: 'Tube 1' });
    server.create('tube', { id: 'recTube2', name: 'Tube 2' });
    server.create('tube', { id: 'recTube3', name: 'Tube 3' });
    server.create('thematic', {
      id: 'recThematic1',
      name: 'Competence 1',
      tubeIds: ['recTube1', 'recTube2', 'recTube3'],
    });
    server.create('competence', { id: 'recCompetence1', name: 'Competence 1', thematicIds: ['recThematic1'] });
    server.create('area', { title: 'Area 1', competenceIds: ['recCompetence1'] });

    // when
    await visit('/selection-sujets');

    // then
    assert.dom('.row-tube').exists({ count: 3 });
  });
});
