import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QROC proposal', function() {

  setupComponentTest('qroc-proposal', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{qroc-proposal}}`);
    expect(this.$()).to.have.length(1);
  });

  describe('Component behavior when user fill input of challenge:', function() {

    it('should display a value when a non-empty value is providing by user', function() {
      // given
      const proposals = '${myInput}';
      this.set('proposals', proposals);
      this.set('answerValue', 'myValue');
      // when
      this.render(hbs`{{qroc-proposal proposals=proposals answerValue=answerValue}}`);
      // then
      expect(this.$('.challenge-response__proposal-input').val()).to.equal('myValue');
    });
  });

  //     block.push(Ember.Object.create({name: 'myInput', input: 'mylabel'}));

  describe('Component behavior when user skip challenge:', function() {

    [
      {input: 'aband', output: 'aband'},
      {input: '#aband#', output: '#aband#'},
      {input: 'aband#', output: 'aband#'},
      {input: 'ABAND', output: 'ABAND'},
      {input: '#ABAND', output: '#ABAND'},
      {input: 'ABAND#', output: 'ABAND#'},
      {input: '#ABAND#', output: ''},
      {input: '', output: ''}
    ].forEach(({input, output}) => {

      it(`should display '' value ${input} is providing to component`, function() {
        // given
        this.set('proposals', '${myLabel}');
        this.set('answerValue', input);
        // when
        this.render(hbs`{{qroc-proposal proposals=proposals answerValue=answerValue}}`);
        // then
        expect(this.$('.challenge-response__proposal-input').val()).to.be.equal(output);
      });

    });
  });

});
