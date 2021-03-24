/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { click, fillIn, render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { clickByLabel } from '../../../../../helpers/click-by-label';

describe('Integration | Component | routes/campaigns/restricted/join-sup', function() {
  setupIntlRenderingTest();

  let sessionStub;
  let storeStub;
  let onSubmitToReconcileStub;

  beforeEach(function() {
    sessionStub = Service.extend({});
    storeStub = Service.extend({});
    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  context('when the student number is typed', function() {
    it('should show user data form', async function() {
      // given
      this.set('onSubmitToReconcileStub', onSubmitToReconcileStub);

      // when
      await render(hbs`<Routes::Campaigns::Restricted::JoinSup @campaignCode={{123}} @onSubmitToReconcile={{this.onSubmitToReconcileStub}}/>`);

      await fillIn('#studentNumber', '1234');
      await click('[type="submit"]');
      // then
      expect(find('#firstName')).to.exist;
    });

    it('should disable input student number', async function() {
      // when
      this.set('onSubmitToReconcileStub', onSubmitToReconcileStub);

      // given
      await render(hbs`<Routes::Campaigns::Restricted::JoinSup @campaignCode={{123}} @onSubmitToReconcile={{this.onSubmitToReconcileStub}}/>`);

      await fillIn('#studentNumber', '1234');
      await click('[type="submit"]');

      // then
      expect(find('#studentNumber')).to.exist;
      expect(find('#studentNumber').disabled).to.be.true;
    });
  });

  context('when i want change the student number', function() {
    it('should be possible to edit student number when a mistake was done', async function() {
      // when
      this.set('onSubmitToReconcileStub', onSubmitToReconcileStub);

      // given
      await render(hbs`<Routes::Campaigns::Restricted::JoinSup @campaignCode={{123}} @onSubmitToReconcile={{this.onSubmitToReconcileStub}}/>`);

      await fillIn('#studentNumber', '1234');
      await click('[type="submit"]');
      await clickByLabel('Modifier le numéro étudiant');

      // then
      expect(find('#studentNumber').disabled).to.be.false;
    });
  });

  context('when i don’t have a student number', function() {
    it('should display user data form', async function() {
      // when
      this.set('onSubmitToReconcileStub', onSubmitToReconcileStub);

      // given
      await render(hbs`<Routes::Campaigns::Restricted::JoinSup @campaignCode={{123}} @onSubmitToReconcile={{this.onSubmitToReconcileStub}}/>`);

      await click('[type="checkbox"]');

      // then
      expect(find('#studentNumber').disabled).to.be.true;
      expect(find('#firstName')).to.exist;
    });
  });
});
