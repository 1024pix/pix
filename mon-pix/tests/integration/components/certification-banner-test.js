import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Certification Banner', function() {

  setupComponentTest('certification-banner', {
    integration: true
  });

  context('On component rendering', function() {
    const fullName = 'shi fu';
    const certificationNumber = 'certification-number';

    beforeEach(function() {
      this.register('service:currentUser', Service.extend({ user: { fullName } }));
      this.inject.service('currentUser', { as: 'currentUser' });
    });

    it('should render component with user fullName and certificationNumber', function() {
      // when
      this.set('certificationNumber', certificationNumber);
      this.render(hbs`{{certification-banner certificationNumber=certificationNumber}}`);

      // then
      expect(this.$('.certification-banner__container .certification-banner__user-fullname')).to.have.lengthOf(1);
      expect(this.$('.certification-banner__container .certification-banner__user-fullname').text().trim()).to.equal(fullName);
      expect(this.$('.certification-banner__container .certification-banner__certification-number')).to.have.lengthOf(1);
      expect(this.$('.certification-banner__container .certification-banner__certification-number').text().trim()).to.equal(`#${certificationNumber}`);
    });

  });
});
