/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach
} from 'mocha';
import Ember from 'ember';
import { initialize, inferApiHost } from 'pix-live/initializers/infer-api-host';

describe('InferApiHostInitializer', function() {
  let container, application;

  beforeEach(function() {
    Ember.run(function() {
      application = Ember.Application.create();
      container = application.__container__;
      application.deferReadiness();
    });
  });

  it('works on the EmberENV global', function() {
    initialize(application);

    expect(EmberENV.apiHost).to.be.ok;
    expect(EmberENV.apiHost.current).to.be.ok;
  });

  describe('inferApiHost', function () {
    it('should detect localhost', function () {
      const apiHost = inferApiHost({ hostname: 'localhost:4200' });
      expect(apiHost).to.equal(`http://${EmberENV.apiHost.localhost}`)
    });

    it('should detect Pix prod', function () {
      const apiHost = inferApiHost({ hostname: 'pix.beta.gouv.fr' });
      expect(apiHost).to.equal(`https://api-prod.${EmberENV.apiHost.pix}`)
    });

    it('should detect Pix development', function () {
      const apiHost = inferApiHost({ hostname: 'development.pix.beta.gouv.fr' });
      expect(apiHost).to.equal(`http://api-development.${EmberENV.apiHost.pix}`)
    });

    it('should detect branches environment', function () {
      const apiHost = inferApiHost({ hostname: '123-user-stories-are-magic.pix.beta.gouv.fr' });
      expect(apiHost).to.equal(`http://123-user-stories-are-magic.${EmberENV.apiHost.pix}`)
    });
  });
});
