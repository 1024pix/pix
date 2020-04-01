import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  blur,
  click,
  find,
  findAll,
  fillIn,
  render
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TOGGLE_LINK = '.feedback-panel__open-link';
const BUTTON_SEND = '.feedback-panel__button--send';

const TEXTAREA = 'textarea.feedback-panel__field--content';
const DROPDOWN = '.feedback-panel__dropdown';
const TUTORIAL_AREA = '.feedback-panel__tutorial-content';

const PICK_CATEGORY_WITH_NESTED_LEVEL = 'instructions';
const PICK_CATEGORY_WITH_TEXTAREA = 'link';
const PICK_CATEGORY_WITH_TUTORIAL = 'picture';

function expectFormViewToBeVisible() {
  expect(find('.feedback-panel__view--form')).to.exist;
}

function expectFormViewToNotBeVisible() {
  expect(find('.feedback-panel__view--form')).to.not.exist;
}

function expectMercixViewToBeVisible() {
  expect(find('.feedback-panel__view--mercix')).to.exist;
}

async function setContent(content) {
  await fillIn(DROPDOWN, PICK_CATEGORY_WITH_TEXTAREA);
  await fillIn(TEXTAREA, content);
  await blur(TEXTAREA);
}

describe('Integration | Component | feedback-panel', function() {

  setupRenderingTest();

  describe('Default rendering', function() {

    beforeEach(async function() {
      await render(hbs`{{feedback-panel isFormOpened=false}}`);
    });

    it('should display the feedback panel', function() {
      expect(find('.feedback-panel__view--link')).to.exist;
    });

    it('should toggle the form view when clicking on the toggle link', async function() {
      // when
      await click(TOGGLE_LINK);

      // then
      expectFormViewToBeVisible();

      // then when
      await click(TOGGLE_LINK);

      // then
      expectFormViewToNotBeVisible();
    });
  });

  describe('Form view', function() {

    const storeStub = Service.extend({
      createRecord() {
        return Object.create({
          save() {
            return resolve();
          }
        });
      }
    });

    beforeEach(async function() {
      const assessment = EmberObject.extend({ id: 'assessment_id' }).create();
      const challenge = EmberObject.extend({ id: 'challenge_id' }).create();

      this.set('assessment', assessment);
      this.set('challenge', challenge);

      this.owner.unregister('service:store');
      this.owner.register('service:store', storeStub);

      await render(hbs`{{feedback-panel assessment=assessment challenge=challenge isFormOpened=true}}`);
    });

    it('should display the "form" view', function() {
      expectFormViewToBeVisible();
      expect(findAll(DROPDOWN).length).to.equal(1);
    });

    it('clicking on "send" button should display the "mercix" view', async function() {
      // given
      const CONTENT_VALUE = 'Prêtes-moi ta plume, pour écrire un mot';
      await setContent(CONTENT_VALUE);

      // when
      await click(BUTTON_SEND);

      // then
      expectFormViewToNotBeVisible();
      expectMercixViewToBeVisible();
    });

    context('selecting a category', function() {
      it('should display a second dropdown with the list of questions', async function() {
        // when
        await fillIn('.feedback-panel__dropdown', PICK_CATEGORY_WITH_NESTED_LEVEL);

        // then
        expect(findAll(DROPDOWN).length).to.equal(2);
        expect(find(TEXTAREA)).to.not.exist;
        expect(find(BUTTON_SEND)).to.not.exist;
      });

      it('with no further questions should directly display the message box and the submit button', async function() {
        // when
        await fillIn('.feedback-panel__dropdown', PICK_CATEGORY_WITH_TEXTAREA);

        // then
        expect(findAll(DROPDOWN).length).to.equal(1);
        expect(findAll(BUTTON_SEND).length).to.equal(1);
      });

      it('with a tuto should directly display the tuto without the textbox nor the send button', async function() {
        // when
        await fillIn('.feedback-panel__dropdown', PICK_CATEGORY_WITH_TUTORIAL);

        // then
        expect(findAll(DROPDOWN).length).to.equal(1);
        expect(find(BUTTON_SEND)).to.not.exist;
        expect(find(TEXTAREA)).to.not.exist;
      });

      it('selecting another category should show the correct feedback action', async function() {
        // when
        await fillIn('.feedback-panel__dropdown', PICK_CATEGORY_WITH_TUTORIAL);
        await fillIn('.feedback-panel__dropdown', PICK_CATEGORY_WITH_TEXTAREA);

        // then
        expect(findAll(DROPDOWN).length).to.equal(1);
        expect(find(TUTORIAL_AREA)).to.not.exist;
        expect(find(BUTTON_SEND)).to.exist;
        expect(find(TEXTAREA)).to.exist;
      });

      it('with fewer levels after a deeper category should hide the second dropdown', async function() {
        // when
        await fillIn('.feedback-panel__dropdown', PICK_CATEGORY_WITH_NESTED_LEVEL);
        await fillIn('.feedback-panel__dropdown', PICK_CATEGORY_WITH_TEXTAREA);

        // then
        expect(findAll(DROPDOWN).length).to.equal(1);
        expect(find(TUTORIAL_AREA)).to.not.exist;
        expect(find(BUTTON_SEND)).to.exist;
        expect(find(TEXTAREA)).to.exist;
      });
    });

  });

  describe('Error management', function() {

    it('should display error if "content" is empty', async function() {
      // given
      await render(hbs`{{feedback-panel isFormOpened=true}}`);
      await fillIn('.feedback-panel__dropdown', PICK_CATEGORY_WITH_TEXTAREA);

      // when
      await click(BUTTON_SEND);

      // then
      expect(find('.alert')).to.exist;
    });

    it('should display error if "content" is blank', async function() {
      // given
      await render(hbs`{{feedback-panel isFormOpened=true}}`);
      await setContent('');

      // when
      await click(BUTTON_SEND);

      // then
      expect(find('.alert')).to.exist;
    });

    it('should not display error if "form" view (with error) was closed and re-opened', async function() {
      // given
      await render(hbs`{{feedback-panel isFormOpened=true}}`);
      await setContent('   ');
      await click(BUTTON_SEND);

      // when
      await click(TOGGLE_LINK);
      await click(TOGGLE_LINK);

      // then
      expect(find('.alert')).to.not.exist;
    });
  });

  it('should be reseted when challenge is changed', async function() {
    // given
    this.set('challenge', 1);
    await render(hbs`{{feedback-panel challenge=challenge isFormOpened=false}}`);
    await click(TOGGLE_LINK);
    await setContent('TEST_CONTENT');

    // when
    this.set('challenge', 2);

    // then
    expect(find(TEXTAREA)).to.not.exist;

    // when
    await click(TOGGLE_LINK);

    // then
    expect(find(TEXTAREA).value).to.equal('');
  });
});
