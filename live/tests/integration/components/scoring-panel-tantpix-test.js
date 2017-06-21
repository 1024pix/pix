import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
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
  setupComponentTest('scoring-panel-tantpix', {
    integration: true
  });

  describe('On Component rendering:', function() {
    beforeEach(function() {
      this.render(hbs`{{scoring-panel-tantpix}}`);
    });

    it('should render successfully component wrapper', function() {
      expect(this.$()).to.have.length(1);
      expect(this.$(COMPONENT_WRAPPER)).to.lengthOf(1);
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

      ].forEach(({wrapperDescription, wrapperClass, wrapperTagName, wrapperLength}) => {
        it(`should contain: ${wrapperDescription} in scoring panel`, function() {
          const wrapperRendered = this.$(wrapperClass);
          expect(wrapperRendered.prop('tagName').toLowerCase()).to.equal(wrapperTagName);
          expect(wrapperRendered).to.lengthOf(wrapperLength);
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
      ].forEach(({itemDescription, itemClass, itemTagName, itemContent}) => {
        it(`should be ${itemDescription} in scoring panel`, function() {
          const itemRendered = this.$(itemClass);
          expect(itemRendered.prop('tagName').toLowerCase()).to.equal(itemTagName);
          expect(itemRendered.text().trim()).to.be.equal(itemContent);
        });
      });

      it('should return a smiley illustration which satisfy minimals accessibilities conditions', function() {
        const smiley = this.$(HEADING_ILLUSTRATION_CLASS);
        expect(smiley.attr('src')).to.includes('/images/smiley.png');
        expect(smiley.attr('srcset')).to.includes('/images/smiley@2x.png');
        expect(smiley.attr('srcset')).to.includes('/images/smiley@3x.png');
        expect(smiley.attr('alt')).to.includes('smiley');
      });
    });

  });

});
