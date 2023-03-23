import { module, test } from 'qunit';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | SessionFinalization::ComplementaryInformationStep', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('on click on incident during certification session checkbox, it should call toggleIncidentDuringCertificationSession', async function (assert) {
    // given
    const toggleSessionJoiningIssueStub = sinon.stub();
    const toggleIncidentDuringCertificationSessionStub = sinon.stub();
    this.set('toggleSessionJoiningIssue', toggleSessionJoiningIssueStub);
    this.set('toggleIncidentDuringCertificationSession', toggleIncidentDuringCertificationSessionStub);

    const screen = await renderScreen(hbs`
        <SessionFinalization::ComplementaryInformationStep
          @toggleIncidentDuringCertificationSession={{this.toggleIncidentDuringCertificationSession}}
          @toggleSessionJoiningIssue={{this.toggleSessionJoiningIssue}}
        />
      `);

    // when
    await click(
      screen.getByRole('checkbox', {
        name: 'Malgré un incident survenu pendant la session, les candidats ont pu terminer leur test de certification. Un temps supplémentaire a été accordé à un ou plusieurs candidats.',
      })
    );

    // then
    assert.ok(true);
    sinon.assert.calledOnceWithExactly(toggleIncidentDuringCertificationSessionStub, true);
  });

  test('on click on issue with joining session checkbox, it should call toggleSessionJoiningIssue', async function (assert) {
    // given
    const toggleSessionJoiningIssueStub = sinon.stub();
    const toggleIncidentDuringCertificationSessionStub = sinon.stub();
    this.set('toggleSessionJoiningIssue', toggleSessionJoiningIssueStub);
    this.set('toggleIncidentDuringCertificationSession', toggleIncidentDuringCertificationSessionStub);

    const screen = await renderScreen(hbs`
        <SessionFinalization::ComplementaryInformationStep
          @toggleIncidentDuringCertificationSession={{this.toggleIncidentDuringCertificationSession}}
          @toggleSessionJoiningIssue={{this.toggleSessionJoiningIssue}}
        />
      `);

    // when
    await click(
      screen.getByRole('checkbox', {
        name: "Un ou plusieurs candidats étaient présents en session de certification mais n'ont pas pu rejoindre la session.",
      })
    );

    // then
    assert.ok(true);
    sinon.assert.calledOnceWithExactly(toggleSessionJoiningIssueStub, true);
  });

  test('it should not check the checkboxes by default', async function (assert) {
    // given
    const hasIssueWithJoiningSessionStub = sinon.stub();
    const hasIncidentDuringCertificationSessionStub = sinon.stub();
    this.set('hasIssueWithJoiningSession', hasIssueWithJoiningSessionStub);
    this.set('hasIncidentDuringCertificationSession', hasIncidentDuringCertificationSessionStub);

    // when
    const screen = await renderScreen(hbs`
        <SessionFinalization::ComplementaryInformationStep
          @onCheckIncidentDuringCertificationSession={{this.hasIncidentDuringCertificationSession}}
          @onCheckSessionJoiningIssue={{this.hasIssueWithJoiningSession}}
        />
      `);

    // then
    assert.false(
      screen.getByRole('checkbox', {
        name: 'Malgré un incident survenu pendant la session, les candidats ont pu terminer leur test de certification. Un temps supplémentaire a été accordé à un ou plusieurs candidats.',
      }).checked
    );
    assert.false(
      screen.getByRole('checkbox', {
        name: "Un ou plusieurs candidats étaient présents en session de certification mais n'ont pas pu rejoindre la session.",
      }).checked
    );
  });

  test('it should display joining issue information message and link when joining issue is checked', async function (assert) {
    // given
    const toggleSessionJoiningIssueStub = sinon.stub();
    const toggleIncidentDuringCertificationSessionStub = sinon.stub();
    this.set('toggleSessionJoiningIssue', toggleSessionJoiningIssueStub);
    this.set('toggleIncidentDuringCertificationSession', toggleIncidentDuringCertificationSessionStub);

    const screen = await renderScreen(hbs`
        <SessionFinalization::ComplementaryInformationStep
          @toggleIncidentDuringCertificationSession={{this.toggleIncidentDuringCertificationSession}}
          @toggleSessionJoiningIssue={{this.toggleSessionJoiningIssue}}
        />
      `);

    // when
    await click(
      screen.getByRole('checkbox', {
        name: "Un ou plusieurs candidats étaient présents en session de certification mais n'ont pas pu rejoindre la session.",
      })
    );

    // then
    assert.dom(screen.queryByText('Vous trouverez')).exists();
    assert
      .dom(
        screen.getByRole('link', {
          name: 'ici un document pour vous aider à résoudre ce type de problème de connexion pour les prochaines sessions. (PDF, 131ko)',
        })
      )
      .exists();
  });
});
