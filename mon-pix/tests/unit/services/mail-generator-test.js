import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Service | mail generator', function() {
  setupTest();

  it('exists', function() {
    const service = this.owner.lookup('service:mail-generator');
    expect(service).to.be.ok;
  });

  it('should have a generateEmail function', function() {
    // Given
    const service = this.owner.lookup('service:mail-generator');

    // When
    expect(service).to.have.property('generateEmail')
      .and.to.be.a('function');
  });

  describe('#generateEmail', function() {
    let service;
    let clock;
    const februaryTheFifth = new Date(2017, 1, 5);

    beforeEach(function() {
      service = this.owner.lookup('service:mail-generator');
      clock = sinon.useFakeTimers(februaryTheFifth);
    });

    afterEach(() => {
      clock.restore();
    });

    it('when the environment is production', function() {
      // Given
      const host = 'pix.fr';
      const env = 'production';

      // When
      const email = service.generateEmail('recigAYl5bl96WGXj', '267845', host, env);

      // Then
      expect(email).to.equal('recigAYl5bl96WGXj-267845-0502@pix-infra.ovh');
    });

    describe('when the environment is integration ', function() {
      it('it should add a label to the email', function() {
        // Given
        const env = 'integration';
        const branchName = 'ma-branche';
        const host = `${branchName}.pix.fr`;

        // When
        const email = service.generateEmail('recigAYl5bl96WGXj', '267845', host, env);

        // Then
        expect(email).to.equal('recigAYl5bl96WGXj-267845-0502+ma-branche@pix-infra.ovh');
      });
    });

    describe('when the environment is staging ', function() {
      it('it should add a label to the email', function() {
        // Given
        const env = 'staging';
        const branchName = 'ma-branche';
        const host = `${branchName}.pix.fr`;

        // When
        const email = service.generateEmail('recigAYl5bl96WGXj', '267845', host, env);

        // Then
        expect(email).to.equal('recigAYl5bl96WGXj-267845-0502+ma-branche@pix-infra.ovh');
      });
    });

    describe('when the environment is development ', function() {
      it('it should add a label to the email', function() {
        // Given
        const env = 'development';
        const host = 'localhost';

        // When
        const email = service.generateEmail('recigAYl5bl96WGXj', '267845', host, env);

        // Then
        expect(email).to.equal('recigAYl5bl96WGXj-267845-0502@localhost');
      });
    });

  });
});
