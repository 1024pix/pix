import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const COMPONENT_WRAPPER = '.scoring-panel-tantpix';

const HEADING_ILLUSTRATION_CLASS_WRAPPER = '.tantpix-panel__illustration-container';
const HEADING_ILLUSTRATION_CLASS = '.tantpix-panel__illustration';
const HEADING_ILLUSTRATION_CONTENT = '';

const HEADING_TITLE_CLASS_WRAPPER = '.tantpix-panel__title-container';
const HEADING_TITLE_CLASS = '.tantpix-panel__title';
const HEADING_TITLE_CONTENT = 'Tant pix !';

const DESCRIPTION_CLASS_WRAPPER = '.tantpix-panel__description-container';
const DESCRIPTION_CLASS = '.tantpix-panel__description';
const DESCRIPTION_CONTENT = 'Manifestement, ce n\'est pas votre jour mais vous ferez mieux la prochaine fois.';

const BUTTON_NEXT_CLASS_WRAPPER = '.tantpix-panel__button-container';
const BUTTON_NEXT_CLASS = '.tantpix-panel__button';
const BUTTON_NEXT_CONTENT = 'revenir à l\'accueil';

describe('Integration | Component | scoring panel tantpix', function() {
  setupRenderingTest();

  describe('On Component rendering:', function() {
    beforeEach(async function() {
      await render(hbs`{{scoring-panel-tantpix}}`);
    });

    it('should render successfully component wrapper', function() {
      expect(find('.scoring-panel-tantpix')).to.exist;
      expect(find(COMPONENT_WRAPPER)).to.exist;
    });

    describe('wrappers rendering', function() {
      [
        {
          wrapperDescription: 'an illustration wrapper',
          wrapperClass: HEADING_ILLUSTRATION_CLASS_WRAPPER,
          wrapperTagName: 'div',
          wrapperLength: 1
        },

        {
          wrapperDescription: 'a title wrapper',
          wrapperClass: HEADING_TITLE_CLASS_WRAPPER,
          wrapperTagName: 'div',
          wrapperLength: 1
        },

        {
          wrapperDescription: 'a description wrapper',
          wrapperClass: DESCRIPTION_CLASS_WRAPPER,
          wrapperTagName: 'div',
          wrapperLength: 1
        },

        {
          wrapperDescription: 'a next button wrapper',
          wrapperClass: BUTTON_NEXT_CLASS_WRAPPER,
          wrapperTagName: 'div',
          wrapperLength: 1
        },

      ].forEach(({ wrapperDescription, wrapperClass, wrapperTagName, wrapperLength }) => {
        it(`should contain: ${wrapperDescription} in scoring panel`, function() {
          expect(find(wrapperClass).tagName.toLowerCase()).to.equal(wrapperTagName);
          expect(findAll(wrapperClass)).to.lengthOf(wrapperLength);
        });
      });

    });

    describe('wrapped items:', function() {
      [
        {
          itemDescription: 'an smiley illustration img',
          itemClass: HEADING_ILLUSTRATION_CLASS,
          itemTagName: 'img',
          itemContent: HEADING_ILLUSTRATION_CONTENT
        },
        {
          itemDescription: 'a title',
          itemClass: HEADING_TITLE_CLASS,
          itemTagName: 'h1',
          itemContent: HEADING_TITLE_CONTENT
        },
        {
          itemDescription: 'an description',
          itemClass: DESCRIPTION_CLASS,
          itemTagName: 'p',
          itemContent: DESCRIPTION_CONTENT
        },
        {
          itemDescription: 'a button go to next text',
          itemClass: BUTTON_NEXT_CLASS,
          itemTagName: 'button',
          itemContent: BUTTON_NEXT_CONTENT
        },
      ].forEach(({ itemDescription, itemClass, itemTagName, itemContent }) => {
        it(`should be ${itemDescription} in scoring panel`, function() {
          const itemRendered = find(itemClass);
          expect(itemRendered.tagName.toLowerCase()).to.equal(itemTagName);
          expect(itemRendered.textContent.trim()).to.be.equal(itemContent);
        });
      });

      it('should return a smiley illustration which satisfy minimals accessibilities conditions', function() {
        const smiley = find(HEADING_ILLUSTRATION_CLASS);
        expect(smiley.getAttribute('src')).to.includes('/images/smiley.png');
        expect(smiley.getAttribute('srcset')).to.includes('/images/smiley@2x.png');
        expect(smiley.getAttribute('srcset')).to.includes('/images/smiley@3x.png');
        expect(smiley.getAttribute('alt')).to.includes('smiley');
      });
    });

  });

});
