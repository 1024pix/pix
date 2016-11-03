/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it,
  afterEach,
  beforeEach
} from 'mocha';
import Ember from 'ember';
import { initialize, configurePixApiHost } from 'pix-live/initializers/configure-pix-api-host';
import ENV from 'pix-live/config/environment';

describe('ConfigurePixApiHostInitializer', function () {
  let container, application;

  beforeEach(function () {
    Ember.run(function () {
      application = Ember.Application.create();
      container = application.__container__;
      application.deferReadiness();
    });
  });

  afterEach(function () {
    ENV.environment = 'test';
  });

  it('works on the EmberENV global', function () {
    initialize(application);

    expect(EmberENV.pixApiHost).to.be.ok;
  });

  describe('configurePixApiHost', function () {

    it('should detect Pix production', function () {
      // given
      ENV.environment = 'production';

      // when
      const pixApiHost = configurePixApiHost();

      // then
      expect(pixApiHost).to.equal('https://api-prod.pix-app.ovh')
    });

    it('should detect Pix staging', function () {
      // given
      ENV.environment = 'staging';

      // when
      const pixApiHost = configurePixApiHost();

      // then
      expect(pixApiHost).to.equal('http://api-staging.pix-app.ovh')
    });

    it('should detect Pix integration', function () {
      // given
      ENV.environment = 'integration';
      const location = { hostname: '123-user-stories-are-magic.pix.beta.gouv.fr' };

      // when
      const pixApiHost = configurePixApiHost(location);

      // then
      expect(pixApiHost).to.equal(`http://123-user-stories-are-magic.pix-app.ovh`)
    });

    it('should detect localhost', function () {
      // given
      const location = { hostname: 'localhost:4200' };

      // when
      const pixApiHost = configurePixApiHost(location);

      // then
      expect(pixApiHost).to.equal(`http://localhost:3000`);
    });

  });
});
