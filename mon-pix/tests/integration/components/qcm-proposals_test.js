import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QCM proposals', function() {

  setupIntlRenderingTest();

  it('renders', async function() {
    await render(hbs`<QcmProposals />`);
    expect(find('.qcm-proposals')).to.exist;
  });

});

