import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | preselect-target-profile', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser({ user });
    await authenticateSession(user.id);
  });

  test('it should display tubes', async function (assert) {
    // given
    server.create('tube', { id: 'recTube1', practicalTitle: 'Tube 1' });
    server.create('tube', { id: 'recTube2', practicalTitle: 'Tube 2' });
    server.create('tube', { id: 'recTube3', practicalTitle: 'Tube 3' });
    server.create('thematic', {
      id: 'recThematic1',
      name: 'Competence 1',
      tubeIds: ['recTube1', 'recTube2', 'recTube3'],
    });
    server.create('competence', { id: 'recCompetence1', name: 'Competence 1', thematicIds: ['recThematic1'] });
    server.create('area', { id: 'area1', title: 'Area 1', competenceIds: ['recCompetence1'] });
    server.create('framework', { id: 'framework1', areaIds: ['area1'] });

    // when
    const screen = await visit('/selection-sujets');

    const area = await screen.findByText('· Area 1');

    await click(area);

    // then
    assert.dom(await screen.findByLabelText('Tube 1 :')).exists();
    assert.dom(await screen.findByLabelText('Tube 2 :')).exists();
    assert.dom(await screen.findByLabelText('Tube 3 :')).exists();
  });
});
