import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import Details from 'pix-admin/components/autonomous-courses/details';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | AutonomousCourses | Details', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  const autonomousCourse = {
    id: 123,
    publicTitle: 'Parkour',
    internalTitle: 'Mon titre de parcours',
    customLandingPageText: "texte de la page d'accueil",
    code: 'CODE',
    createdAt: '2023-12-27T15:07:57.376Z',
    rollbackAttributes: sinon.stub(),
    save: sinon.stub(),
  };

  hooks.beforeEach(async function () {
    const serviceRouter = this.owner.lookup('service:router');
    sinon.stub(serviceRouter, 'currentRouteName').value('authenticated.autonomous-courses.details');
    sinon
      .stub(serviceRouter, 'currentRoute')
      .value({ localName: 'details', parent: { name: 'authenticated.autonomous-courses' } });

    screen = await render(<template><Details @autonomousCourse={{autonomousCourse}} /></template>);
  });

  test('it should display autonomous course', async function (assert) {
    // when
    const link = screen.getByRole('link', { name: 'Lien vers la campagne CODE (nouvelle fenêtre)' }).textContent;

    // then
    assert.dom(screen.getByText('123')).exists();
    assert.strictEqual(screen.getAllByText('Mon titre de parcours').length, 3);
    assert.dom(screen.getByText("texte de la page d'accueil")).exists();
    assert.dom(screen.getByText('27/12/2023')).exists();
    assert.ok(link.trim().endsWith('/campagnes/CODE'));
  });

  test('it should display update form when requested', async function (assert) {
    // when
    const button = screen.getByText('Modifier');
    await click(button);

    // then
    assert.dom(screen.getByLabelText(/Nom interne/)).exists();
    assert.dom(screen.getByLabelText(/Nom public/)).exists();
    assert.dom(screen.getByLabelText(/Texte de la page d'accueil/)).exists();
    assert.dom(screen.queryByText('Modifier')).doesNotExist();
    assert.dom(screen.getByText('Sauvegarder les modifications')).exists();
  });

  test('it should update the course', async function (assert) {
    // when
    const button = screen.getByText('Modifier');
    await click(button);

    await fillByLabel(/Nom interne/, 'Parcours professionnel');

    const submitButton = screen.getByRole('button', { name: 'Sauvegarder les modifications' });
    await click(submitButton);

    // then
    assert.ok(autonomousCourse.save.called);
    assert.dom(screen.getByText('Modifier')).exists();
    assert.dom(screen.queryByText('Sauvegarder les modifications')).doesNotExist();
  });
});
