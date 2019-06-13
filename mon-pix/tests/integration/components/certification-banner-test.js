import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Certification Banner', function() {

  setupRenderingTest();

  context('On component rendering', function() {
    const fullName = 'shi fu';
    const certificationNumber = 'certification-number';

    beforeEach(function() {
      this.owner.register('service:currentUser', Service.extend({ user: { fullName } }));
    });

    it('should render component with user fullName and certificationNumber', async function() {
      // when
      this.set('certificationNumber', certificationNumber);
      await render(hbs`{{certification-banner certificationNumber=certificationNumber}}`);

      // then
      expect(find('.certification-banner__container .certification-banner__user-fullname')).to.exist;
      expect(find('.certification-banner__container .certification-banner__user-fullname').textContent.trim()).to.equal(fullName);
      expect(find('.certification-banner__container .certification-banner__certification-number')).to.exist;
      expect(find('.certification-banner__container .certification-banner__certification-number').textContent.trim()).to.equal(`#${certificationNumber}`);
    });

  });
});
