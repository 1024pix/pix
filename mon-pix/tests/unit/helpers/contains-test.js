import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { contains } from '../../helpers/contains';

describe('Unit | Helpers | contains', function() {
  setupIntlRenderingTest();

  describe('contains', function() {
    it('should contains Hello', async function() {
      await render(hbs`<div>Hello</div>`);
      expect(contains('Hello')).to.exist;
    });

    it('should not find any element', async function() {
      await render(hbs`<div>Goodbye</div>`);
      expect(contains('Hello')).not.to.exist;
    });

    it('should find only one element', async function() {
      await render(hbs`<div><span id="first">Hello</span><span>Hello</span></div>`);
      expect(contains('Hello').tagName).to.equal('DIV');
    });

    it('should not find any element deeply', async function() {
      await render(hbs`<div><span>Goodbye</span></div>`);
      expect(contains('Hello')).not.to.exist;
    });
  });
});

