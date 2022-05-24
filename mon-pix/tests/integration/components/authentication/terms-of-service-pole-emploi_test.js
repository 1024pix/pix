import { describe, it } from 'mocha';
import { expect } from 'chai';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | authentication::terms-of-service-pole-emploi', function () {
  setupIntlRenderingTest();

  it("should display cgu's pole emploi page", async function () {
    // given & when
    await render(hbs`<Authentication::TermsOfServicePoleEmploi />`);

    // then
    const heading = this.intl.t('pages.terms-of-service-pole-emploi.title');
    const checkboxLabel = this.intl.t('pages.terms-of-service-pole-emploi.cgu');
    const cancelButton = this.intl.t('common.actions.back');
    const submitButton = this.intl.t('pages.terms-of-service-pole-emploi.form.button');
    expect(heading).to.exist;
    expect(checkboxLabel).to.exist;
    expect(cancelButton).to.exist;
    expect(submitButton).to.exist;
  });
});
