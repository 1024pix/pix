import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click } from '@ember/test-helpers';
import Object from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session-finalization-examiner-global-comment-step', function(hooks) {
  setupRenderingTest(hooks);

  module('when feature categorizationOfReports is off', function() {

    test('it renders', async function(assert) {
      // given
      const updateExaminerGlobalCommentStub = sinon.stub();
      this.set('examinerGlobalCommentMaxLength', 500);
      this.set('session', Object.create({ examinerGlobalComment: '' }));
      this.set('updateExaminerGlobalComment', updateExaminerGlobalCommentStub);
      this.set('isReportsCategorizationFeatureToggleEnabled', false);

      // when
      await render(hbs`<SessionFinalizationExaminerGlobalCommentStep @session={{this.session}}
              @isReportsCategorizationFeatureToggleEnabled={{this.isReportsCategorizationFeatureToggleEnabled}}
              @updateExaminerGlobalComment={{this.updateExaminerGlobalComment}}
              @examinerGlobalCommentMaxLength={{this.examinerGlobalCommentMaxLength}}  />`);

      // then
      assert.contains('Vous pouvez indiquer un commentaire global sur cette session, par exemple si vous avez rencontré un problème technique qui a impacté le déroulement de la session.');
    });

    test('it should call the appropriate callback function when typing in the text area', async function(assert) {
      // given
      const updateExaminerGlobalCommentStub = sinon.stub();
      this.set('examinerGlobalCommentMaxLength', 500);
      this.set('session', Object.create({ examinerGlobalComment: '' }));
      this.set('updateExaminerGlobalComment', updateExaminerGlobalCommentStub);
      this.set('isReportsCategorizationFeatureToggleEnabled', false);

      // when
      await render(hbs`<SessionFinalizationExaminerGlobalCommentStep @session={{this.session}}
              @isReportsCategorizationFeatureToggleEnabled={{this.isReportsCategorizationFeatureToggleEnabled}}
              @updateExaminerGlobalComment={{this.updateExaminerGlobalComment}}
              @examinerGlobalCommentMaxLength={{this.examinerGlobalCommentMaxLength}}  />`);
      await fillIn('#examiner-global-comment', 'You are no more a wizard Harry!');

      // then
      assert.equal(updateExaminerGlobalCommentStub.called, true);
    });
  });

  module('when feature categorizationOfReports is on', function() {

    test('it renders the radio buttons', async function(assert) {
      // given
      const updateExaminerGlobalCommentStub = sinon.stub();
      this.set('examinerGlobalCommentMaxLength', 500);
      this.set('session', Object.create({ examinerGlobalComment: '' }));
      this.set('updateExaminerGlobalComment', updateExaminerGlobalCommentStub);
      this.set('isReportsCategorizationFeatureToggleEnabled', true);

      // when
      await render(hbs`<SessionFinalizationExaminerGlobalCommentStep @session={{this.session}}
              @isReportsCategorizationFeatureToggleEnabled={{this.isReportsCategorizationFeatureToggleEnabled}}
              @updateExaminerGlobalComment={{this.updateExaminerGlobalComment}}
              @examinerGlobalCommentMaxLength={{this.examinerGlobalCommentMaxLength}}  />`);

      // then
      assert.contains('Aucun problème sur la session, en dehors des signalements individuels renseignés lors de l\'étape 1.');
      assert.contains('Je souhaite signaler un ou plusieurs incident(s) ayant impacté la session dans son ensemble');
    });

    test('it should display a text area to declare some incident when the appropriate choice is selected', async function(assert) {
      // given
      const updateExaminerGlobalCommentStub = sinon.stub();
      this.set('examinerGlobalCommentMaxLength', 500);
      this.set('session', Object.create({ examinerGlobalComment: '' }));
      this.set('updateExaminerGlobalComment', updateExaminerGlobalCommentStub);
      this.set('isReportsCategorizationFeatureToggleEnabled', true);

      // when
      await render(hbs`<SessionFinalizationExaminerGlobalCommentStep @session={{this.session}}
              @isReportsCategorizationFeatureToggleEnabled={{this.isReportsCategorizationFeatureToggleEnabled}}
              @updateExaminerGlobalComment={{this.updateExaminerGlobalComment}}
              @examinerGlobalCommentMaxLength={{this.examinerGlobalCommentMaxLength}}  />`);
      await click('[aria-label="Signaler un incident"]');

      // then
      assert.dom('textarea').exists();
    });

    test('it should call the appropriate callback function when typing in the text area when declaring an incident', async function(assert) {
      // given
      const updateExaminerGlobalCommentStub = sinon.stub();
      this.set('examinerGlobalCommentMaxLength', 500);
      this.set('session', Object.create({ examinerGlobalComment: '' }));
      this.set('updateExaminerGlobalComment', updateExaminerGlobalCommentStub);
      this.set('isReportsCategorizationFeatureToggleEnabled', true);

      // when
      await render(hbs`<SessionFinalizationExaminerGlobalCommentStep @session={{this.session}}
              @isReportsCategorizationFeatureToggleEnabled={{this.isReportsCategorizationFeatureToggleEnabled}}
              @updateExaminerGlobalComment={{this.updateExaminerGlobalComment}}
              @examinerGlobalCommentMaxLength={{this.examinerGlobalCommentMaxLength}}  />`);
      await click('[aria-label="Signaler un incident"]');
      await fillIn('#examiner-global-comment', 'You are no more a wizard Harry!');

      // then
      assert.equal(updateExaminerGlobalCommentStub.called, true);
    });
  });
});
