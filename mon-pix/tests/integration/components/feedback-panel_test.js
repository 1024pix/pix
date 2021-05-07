import { resolve } from 'rsvp';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import {
  blur,
  click,
  find,
  findAll,
  fillIn,
  render,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const OPEN_FEEDBACK_BUTTON = '.feedback-panel__open-button';
const BUTTON_SEND = '.feedback-panel__button--send';

const TEXTAREA = 'textarea.feedback-panel__field--content';
const DROPDOWN = '.feedback-panel__dropdown';
const CATEGORY_DROPDOWN = 'select[data-test-feedback-category-dropdown]';
const SUBCATEGORY_DROPDOWN = 'select[data-test-feedback-subcategory-dropdown]';
const TUTORIAL_AREA = '.feedback-panel__quick-help';

const PICK_SELECT_OPTION_WITH_NESTED_LEVEL = 'question';
const PICK_ANOTHER_SELECT_OPTION_WITH_NESTED_LEVEL = 'embed';
const PICK_SELECT_OPTION_WITH_TEXTAREA = 'accessibility';
const PICK_SELECT_OPTION_WITH_TUTORIAL = 'picture';
const PICK_SELECT_OPTION_WITH_TEXTAREA_AND_TUTORIAL = '3';

async function setContent(content) {
  await fillIn(DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);
  await fillIn(TEXTAREA, content);
  await blur(TEXTAREA);
}

describe('Integration | Component | feedback-panel', function() {

  setupIntlRenderingTest();

  class StoreStub extends Service {
    createRecord() {
      return Object.create({
        save() {
          return resolve();
        },
      });
    }
  }

  describe('Default rendering', function() {

    beforeEach(async function() {
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);

      this.owner.unregister('service:store');
      this.owner.register('service:store', StoreStub);

      await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);
      expect(find('.feedback-panel__form')).not.to.exist;
      await click(OPEN_FEEDBACK_BUTTON);
    });

    it('should display the "mercix" view when clicking on send button', async function() {
      // given
      const CONTENT_VALUE = 'Prêtes-moi ta plume, pour écrire un mot';
      await setContent(CONTENT_VALUE);

      // when
      await click(BUTTON_SEND);

      // then
      expect(find('.feedback-panel__view--form')).to.not.exist;
      expect(find('.feedback-panel__view--mercix')).to.exist;
    });

    context('when selecting a category', function() {
      it('should display a second dropdown with the list of questions when category have a nested level', async function() {
        // when
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_NESTED_LEVEL);

        // then
        expect(findAll(DROPDOWN).length).to.equal(2);
        expect(find(TEXTAREA)).to.not.exist;
        expect(find(BUTTON_SEND)).to.not.exist;
      });

      it('should directly display the message box and the submit button when category has a textarea', async function() {
        // when
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);

        // then
        expect(findAll(DROPDOWN).length).to.equal(1);
        expect(find(TEXTAREA)).to.exist;
        expect(findAll(BUTTON_SEND).length).to.equal(1);
      });

      it('should directly display the tuto without the textbox or the send button when category has a tutorial', async function() {
        // when
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TUTORIAL);

        // then
        expect(findAll(DROPDOWN).length).to.equal(2);
        expect(find(BUTTON_SEND)).to.not.exist;
        expect(find(TEXTAREA)).to.not.exist;
      });

      it('should show the correct feedback action when selecting two different categories', async function() {
        // when
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TUTORIAL);
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);

        // then
        expect(findAll(DROPDOWN).length).to.equal(1);
        expect(find(TUTORIAL_AREA)).to.not.exist;
        expect(find(BUTTON_SEND)).to.exist;
        expect(find(TEXTAREA)).to.exist;
      });

      it('should hide the second dropdown when category has fewer levels after a deeper category', async function() {
        // when
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_NESTED_LEVEL);
        await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);

        // then
        expect(findAll(DROPDOWN).length).to.equal(1);
        expect(find(TUTORIAL_AREA)).to.not.exist;
        expect(find(BUTTON_SEND)).to.exist;
        expect(find(TEXTAREA)).to.exist;
      });

      it('should display tutorial with textarea with selecting related category and subcategory', async function() {
        // when
        await fillIn(CATEGORY_DROPDOWN, PICK_ANOTHER_SELECT_OPTION_WITH_NESTED_LEVEL);

        await fillIn(SUBCATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA_AND_TUTORIAL);

        // then
        expect(findAll(DROPDOWN).length).to.equal(2);
        expect(find(TUTORIAL_AREA)).to.exist;
        expect(find(TEXTAREA)).to.exist;
        expect(find(BUTTON_SEND)).to.exist;
      });
    });
  });

  context('When assessment is not of type certification', function() {
    beforeEach(async function() {
      await render(hbs`<FeedbackPanel />`);
    });

    it('should display the feedback panel', function() {
      expect(find('.feedback-panel__view--link')).to.exist;
    });

    it('should toggle the form view when clicking on the toggle link', async function() {
      // when
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      expect(find('.feedback-panel__view--form')).to.exist;

      // then when
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      expect(find('.feedback-panel__view--form')).to.not.exist;
    });
  });

  context('When assessment is of type certification', function() {
    beforeEach(async function() {
      const assessment = {
        isCertification: true,
      };
      this.set('assessment', assessment);

      await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @context={{this.context}} />`);
    });

    it('should display the feedback certification section', async function() {
      // when
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      expect(find('.feedback-certification-section__div')).to.exist;
    });
  });

  context('When FeedbackPanel is rendered initially opened (e.g. in a comparison-window)', function() {

    beforeEach(async function() {
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);
      this.set('alwaysOpenForm', true);

      await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} @alwaysOpenForm={{this.alwaysOpenForm}} />`);
    });

    it('should display the "form" view', async function() {
      expect(find('.feedback-panel__view--form')).to.exist;
      expect(findAll(DROPDOWN).length).to.equal(1);
    });

    it('should not be able to hide the form view', async function() {
      // when
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      expect(find('.feedback-panel__form')).to.exist;
    });
  });

  context('When FeedbackPanel is rendered initially closed (e.g. in a challenge)', function() {

    beforeEach(async function() {
      const assessment = { id: 'assessment_id' };
      const challenge = { id: 'challenge_id' };

      this.set('assessment', assessment);
      this.set('challenge', challenge);

      await render(hbs`<FeedbackPanel @assessment={{this.assessment}} @challenge={{this.challenge}} />`);
      expect(find('.feedback-panel__form')).not.to.exist;
      await click(OPEN_FEEDBACK_BUTTON);
    });

    it('should display the "form" view', async function() {
      expect(find('.feedback-panel__view--form')).to.exist;
      expect(findAll(DROPDOWN).length).to.equal(1);
    });

    it('should be able to hide the form view', async function() {
      // when
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      expect(find('.feedback-panel__form')).not.to.exist;
    });
  });

  describe('Error management', function() {

    beforeEach(async function() {
      await render(hbs`<FeedbackPanel />`);
      await click(OPEN_FEEDBACK_BUTTON);
    });

    it('should display error if "content" is empty', async function() {
      // given
      await fillIn(CATEGORY_DROPDOWN, PICK_SELECT_OPTION_WITH_TEXTAREA);

      // when
      await click(BUTTON_SEND);

      // then
      expect(find('.alert')).to.exist;
    });

    it('should display error if "content" is blank', async function() {
      // given
      await setContent('');

      // when
      await click(BUTTON_SEND);

      // then
      expect(find('.alert')).to.exist;
    });

    it('should not display error if "form" view (with error) was closed and re-opened', async function() {
      // given
      await setContent('   ');
      await click(BUTTON_SEND);

      // when
      await click(OPEN_FEEDBACK_BUTTON);
      await click(OPEN_FEEDBACK_BUTTON);

      // then
      expect(find('.alert')).to.not.exist;
    });
  });

});
