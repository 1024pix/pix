import { module, test } from 'qunit';
import { visit, clickByName } from '@1024pix/ember-testing-library';
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

    await clickByName('· Area 1');

    // then
    assert.dom(screen.getByLabelText('Tube 1 :')).exists();
    assert.dom(screen.getByLabelText('Tube 2 :')).exists();
    assert.dom(screen.getByLabelText('Tube 3 :')).exists();
  });
});
