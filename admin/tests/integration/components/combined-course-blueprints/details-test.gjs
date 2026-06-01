import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Details from 'pix-admin/components/combined-course-blueprints/details';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';

module('Integration | Component | CombinedCourseBlueprints::Details', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const currentUser = this.owner.lookup('service:current-user');
    currentUser.adminMember = { userId: 456 };
  });

  test('it should display details for a combined course blueprint', async function (assert) {
    // given
    const combinedCourseBlueprint = {
      id: 123,
      internalName: 'Modèle de parcours apprenant',
      createdAt: new Date('2025-12-25'),
      name: 'Parcours apprenant',
      description: 'Mon super parcours apprenant',
      illustration: 'http://pix.fr/mon-illu.png',
      attestationLabel: '6ème',
      surveyLink: 'http://pix-survey-test.fr',
      content: [
        { type: 'module', value: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a', shortId: 'abc-123' },
        { type: 'evaluation', value: 123 },
      ],
    };

    // when
    const screen = await render(<template><Details @model={{combinedCourseBlueprint}} /></template>);

    // then
    assert.ok(screen.getByText('123'));
    assert.ok(screen.getByRole('heading', { name: 'Modèle de parcours apprenant' }));
    assert.ok(screen.getByText('Parcours apprenant'));
    assert.ok(screen.getByText('25/12/2025'));
    assert.ok(screen.getByText('6ème'));
    assert.ok(screen.getByText('http://pix-survey-test.fr'));
    assert.ok(screen.getByText('Mon super parcours apprenant'));
    assert.ok(screen.getByText('Module - abc-123', { exact: false }));
    assert.ok(screen.getByText('Profil cible - 123', { exact: false }));
    assert.ok(screen.getByRole('link', { name: t('components.combined-course-blueprints.list.downloadButton') }));
  });

  test('it should not display survey link if not available', async function (assert) {
    // given
    const combinedCourseBlueprint = {
      id: 123,
      internalName: 'Modèle de parcours apprenant',
    };

    // when
    const screen = await render(<template><Details @model={{combinedCourseBlueprint}} /></template>);

    // then
    assert.ok(screen.getByText(t('components.combined-course-blueprints.survey-link.not-provided')));
  });

  test('should hide description and illustration if not provided', async function (assert) {
    // given
    const combinedCourseBlueprint = {
      id: 123,
      internalName: 'Modèle de parcours apprenant',
      createdAt: new Date('2025-12-25'),
      name: 'Parcours apprenant',
      content: [
        { type: 'module', value: 'abc-123' },
        { type: 'evaluation', value: 123 },
      ],
    };
    // when
    const screen = await render(<template><Details @model={{combinedCourseBlueprint}} /></template>);

    assert.notOk(screen.queryByText(t('components.combined-course-blueprints.labels.description')));
    assert.notOk(screen.queryByText(t('components.combined-course-blueprints.labels.illustration')));
  });
});
