import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'qroc-proposal',
  'Integration: QrocProposalComponent',
  {
    integration: true
  },
  function () {
    it('renders', function () {
      this.render(hbs`{{qroc-proposal}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
