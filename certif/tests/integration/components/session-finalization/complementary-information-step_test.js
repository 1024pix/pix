import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | SessionFinalization::ComplementaryInformationStep', function (hooks) {
  setupRenderingTest(hooks);

  test('on click on incident during certification session checkbox, it should call report incident controller', async function (assert) {
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

    // when
    await click(
      screen.getByRole('checkbox', {
        name: 'Malgré un incident survenu pendant la session, les candidats ont pu terminer leur test de certification. Un temps supplémentaire a été accordé à un ou plusieurs candidats.',
      })
    );

    // then
    assert.ok(true);
    sinon.assert.calledOnce(hasIncidentDuringCertificationSessionStub);
  });

  test('on click on issue with joining session checkbox, it should call report issue with joining session controller', async function (assert) {
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

    // when
    await click(
      screen.getByRole('checkbox', {
        name: "Un ou plusieurs candidats étaient présents en session de certification mais n'ont pas pu rejoindre la session.",
      })
    );

    // then
    assert.ok(true);
    sinon.assert.calledOnce(hasIssueWithJoiningSessionStub);
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
});
