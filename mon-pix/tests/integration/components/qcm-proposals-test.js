import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntegration from '../../helpers/setup-integration';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QCM proposals', function() {

  setupIntegration();

  it('renders', async function() {
    await render(hbs`{{qcm-proposals}}`);
    expect(find('.qcm-proposals')).to.exist;
  });

});

