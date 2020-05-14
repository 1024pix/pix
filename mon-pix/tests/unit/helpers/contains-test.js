import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { contains, containsAll } from '../../helpers/contains';

describe('Unit | Helpers | contains', function() {
  setupRenderingTest();

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
      expect(contains('Hello').getAttribute('id')).to.equal('first');
    });

    it('should not find any element deeply', async function() {
      await render(hbs`<div><span>Goodbye</span></div>`);
      expect(contains('Hello')).not.to.exist;
    });

    it('should return element that contains exactly the text', async function() {
      await render(hbs`<div>Hellow</div>`);
      expect(contains('Hello')).not.to.exist;
    });
  });

  describe('containsAll', function() {
    it('should contains Hello twice', async function() {
      await render(hbs`<ul><li>Hello</li><li>Hello</li></ul>`);
      expect(containsAll('Hello')).to.have.lengthOf(2);
    });

    it('should not find any elements', async function() {
      await render(hbs`<ul><li>Goodbye</li><li>Hellow</li></ul>`);
      expect(containsAll('Hello')).to.have.lengthOf(0);
    });
  });
});

