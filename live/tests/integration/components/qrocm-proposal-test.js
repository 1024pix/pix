import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'qrocm-proposal',
  'Integration: QrocmProposalComponent',
  {
    integration: true
  },
  function () {
    it('renders', function () {
      this.render(hbs`{{qrocm-proposal}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
