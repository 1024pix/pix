import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateByEmail } from '../helpers/authentication';

module('Acceptance | User account', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When in profile', function () {
    test('should open tests page when click on menu', async function (assert) {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations', { firstName: 'Henri' });
      const screen = await authenticateByEmail(user);

      // when
      await click(screen.getByRole('button', { name: 'Henri Consulter mes informations' }));
      await click(screen.getByRole('link', { name: 'Mes parcours' }));

      // then
      assert.strictEqual(currentURL(), '/mes-parcours');
    });

    test('should open certifications page when click on menu', async function (assert) {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations', { firstName: 'Henri' });
      const screen = await authenticateByEmail(user);

      // when
      await click(screen.getByRole('button', { name: 'Henri Consulter mes informations' }));
      await click(screen.getByRole('link', { name: 'Mes certifications' }));

      // then
      assert.strictEqual(currentURL(), '/mes-certifications');
    });

    test('should contain link to pix.fr/support', async function (assert) {
      // given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations', { firstName: 'Henri' });
      const screen = await authenticateByEmail(user);

      // when
      await click(screen.getByRole('button', { name: 'Henri Consulter mes informations' }));

      // then
      const helplink = screen.getByRole('link', { name: 'Aide' }).getAttribute('href');
      assert.strictEqual(helplink, 'https://pix.fr/support');
    });

    test('should open My account page when click on menu', async function (assert) {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations', { firstName: 'Henri' });
      const screen = await authenticateByEmail(user);
      await click(screen.getByRole('button', { name: 'Henri Consulter mes informations' }));

      // when
      await click(screen.getByRole('link', { name: 'Mon compte' }));

      // then
      assert.strictEqual(currentURL(), '/mon-compte/informations-personnelles');
    });
  });

  test('should close menu when click outside', async function (assert) {
    // given
    server.create('campaign-participation-overview', { assessmentState: 'completed' });
    const user = server.create('user', 'withEmail', 'withAssessmentParticipations', { firstName: 'Henri' });
    const screen = await authenticateByEmail(user);
    await click(screen.getByRole('button', { name: 'Henri Consulter mes informations' }));

    // when
    await click(screen.getByRole('link', { name: 'Mes parcours' }));

    // then
    assert.dom(screen.queryByRole('button', { name: 'Henri Consulter mes informations', expanded: false })).exists();
  });
});
