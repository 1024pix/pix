import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { blur, click, find, fillIn, render } from '@ember/test-helpers';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import _ from 'mon-pix/utils/lodash-custom';

const LINK_VIEW = '.feedback-panel__view--link';
const FORM_VIEW = '.feedback-panel__view--form';
const MERCIX_VIEW = '.feedback-panel__view--mercix';
const OPEN_LINK = '.feedback-panel__open-link';
const BUTTON_SEND = '.feedback-panel__button--send';
const BUTTON_CANCEL = '.feedback-panel__button--cancel';

function expectLinkViewToBeVisible() {
  expect(find(LINK_VIEW)).to.exist;
  expect(find(FORM_VIEW)).to.not.exist;
  expect(find(MERCIX_VIEW)).to.not.exist;
}

function expectFormViewToBeVisible() {
  expect(find(LINK_VIEW)).to.not.exist;
  expect(find(FORM_VIEW)).to.exist;
  expect(find(MERCIX_VIEW)).to.not.exist;
}

function expectMercixViewToBeVisible() {
  expect(find(LINK_VIEW)).to.not.exist;
  expect(find(FORM_VIEW)).to.not.exist;
  expect(find(MERCIX_VIEW)).to.exist;
}

async function setContent(content) {
  await fillIn('.feedback-panel__field--content', content);
  await blur('.feedback-panel__field--content');
}

describe('Integration | Component | feedback-panel', function() {

  setupRenderingTest();

  describe('Default rendering', function() {

    it('should display the feedback Panel', async function() {
      // when
      await render(hbs`{{feedback-panel}}`);
      // then
      expect(find('.feedback-panel')).to.exist;
      expectLinkViewToBeVisible();
    });

  });

  describe('Link view (available only when form is closed by default)', function() {

    beforeEach(async function() {
      await render(hbs`{{feedback-panel}}`);
    });

    it('should display only the "link" view', function() {
      expectLinkViewToBeVisible();
    });

    it('the link label should be "Signaler un problème"', function() {
      expect(find(OPEN_LINK).textContent).to.contain('Signaler un problème');
    });

    it('clicking on the open link should hide the "link" view and display the "form" view', async function() {
      // when
      await click(OPEN_LINK);
      // then
      expectFormViewToBeVisible();
    });

  });

  describe('Form view', function() {

    const storeStub = Service.extend({
      createRecord() {
        const createRecordArgs = arguments;
        return Object.create({
          save() {
            isSaveMethodCalled = true;
            saveMethodUrl = createRecordArgs[0];
            saveMethodBody = createRecordArgs[1];
            return resolve();
          }
        });
      }
    });

    let isSaveMethodCalled;
    let saveMethodBody;
    let saveMethodUrl;

    beforeEach(async function() {
      // configure answer & cie. model object
      const assessment = EmberObject.extend({ id: 'assessment_id' }).create();
      const challenge = EmberObject.extend({ id: 'challenge_id' }).create();

      // render component
      this.set('assessment', assessment);
      this.set('challenge', challenge);

      isSaveMethodCalled = false;
      saveMethodBody = null;
      saveMethodUrl = null;

      // stub store service
      this.owner.register('service:store', storeStub);

      await render(hbs`{{feedback-panel assessment=assessment challenge=challenge collapsible=false}}`);
    });

    it('should display only the "form" view', function() {
      expectFormViewToBeVisible();
    });

    it('should contain content textarea field', function() {
      expect(find('textarea.feedback-panel__field--content')).to.exist;
      expect(find('textarea.feedback-panel__field--content').getAttribute('placeholder')).to.equal('Votre message');
    });

    it('should contain "send" button with label "Envoyer"', function() {
      expect(find(BUTTON_SEND)).to.exist;
      expect(find(BUTTON_SEND).textContent).to.equal('Envoyer');
    });

    it('clicking on "send" button should save the feedback into the store / API and display the "mercix" view', async function() {
      // given
      const CONTENT_VALUE = 'Prêtes-moi ta plume, pour écrire un mot';
      await setContent (CONTENT_VALUE);

      // when
      await click(BUTTON_SEND);

      // then
      return wait().then(() => {
        expect(isSaveMethodCalled).to.be.true;
        expect(saveMethodUrl).to.equal('feedback');
        expect(_.isObject(saveMethodBody)).to.equal(true);
        expect(saveMethodBody.assessment).to.exist;
        expect(saveMethodBody.challenge).to.exist;
        expect(saveMethodBody.content).to.equal(CONTENT_VALUE);
        expectMercixViewToBeVisible();
      });
    });

    it('should not contain "cancel" button if the feedback form is opened by default', function() {
      // then
      expect(find(BUTTON_CANCEL)).to.not.exist;
    });
  });

  describe('#Cancel Button management', function() {

    beforeEach(function() {
      // configure answer & cie. model object
      const assessment = EmberObject.extend({ id: 'assessment_id' }).create();
      const challenge = EmberObject.extend({ id: 'challenge_id' }).create();

      // render component
      this.set('assessment', assessment);
      this.set('challenge', challenge);
    });

    it('should not be visible if feedback-panel is not collapsible', async function() {
      // when
      await render(hbs`{{feedback-panel assessment=assessment challenge=challenge collapsible=false}}`);

      // then
      expect(find(BUTTON_CANCEL)).to.not.exist;
    });

    it('should not be visible if status is not FORM_OPENED', async function() {
      // when
      await render(hbs`{{feedback-panel assessment=assessment challenge=challenge collapsible=true _status="FORM_CLOSED"}}`);

      // then
      expect(find(BUTTON_CANCEL)).to.not.exist;
    });

    it('should be visible only if component is collapsible and form is opened', async function() {
      // given
      await render(hbs`{{feedback-panel assessment=assessment challenge=challenge}}`);

      // when
      await click(OPEN_LINK);

      // then
      expect(find(BUTTON_CANCEL)).to.exist;
    });

    it('should contain "cancel" button with label "Annuler" and placeholder "Votre message"', async function() {
      // given
      await render(hbs`{{feedback-panel assessment=assessment challenge=challenge}}`);

      //when
      await click(OPEN_LINK);

      //then
      expect(find(BUTTON_CANCEL)).to.exist;
      expect(find(BUTTON_CANCEL).textContent.trim()).to.equal('Annuler');
    });

    it('clicking on "cancel" button should close the "form" view and display the "link" view', async function() {
      // given
      await render(hbs`{{feedback-panel assessment=assessment challenge=challenge}}`);

      // when
      await click(OPEN_LINK);
      await click(BUTTON_CANCEL);

      // then
      expectLinkViewToBeVisible();
    });

  });

  describe('Error management', function() {

    it('should display error if "content" is empty', async function() {
      // given
      await render(hbs`{{feedback-panel collapsible=false}}`);

      // when
      await click(BUTTON_SEND);

      // then
      expect(find('.alert')).to.exist;
      expectFormViewToBeVisible();
    });

    it('should display error if "content" is blank', async function() {
      // given
      await render(hbs`{{feedback-panel collapsible=false}}`);
      await setContent('');

      // when
      await click(BUTTON_SEND);

      // then
      expect(find('.alert')).to.exist;
      expectFormViewToBeVisible();
    });

    it('should not display error if "form" view (with error) was closed and re-opened', async function() {
      // given
      await render(hbs`{{feedback-panel}}`);

      await click(OPEN_LINK);
      await setContent('   ');

      await click(BUTTON_SEND);
      expect(find('.alert')).to.exist;

      // when
      await click(BUTTON_CANCEL);
      await click(OPEN_LINK);

      // then
      expect(find('.alert')).to.not.exist;
    });

    it('should display an error even if the user did not focus on content', async function() {
      // given
      await render(hbs`{{feedback-panel collapsible=false}}`);

      // when
      await click(BUTTON_SEND);

      // then
      expect(find('.alert')).to.exist;
    });
  });
});
