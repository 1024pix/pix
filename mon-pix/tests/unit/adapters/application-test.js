import { expect } from 'chai';
import { it, describe } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import ENV from 'mon-pix/config/environment';

describe('Unit | Adapter | application', function() {
  setupTest();

  it('should specify /api as the root url', function() {
    // Given
    const applicationAdapter = this.owner.lookup('adapter:application');

    // Then
    expect(applicationAdapter.namespace).to.equal('api');
  });

  it('should add header with authentication token ', function() {
    // Given
    const xhr = {
      setRequestHeader: sinon.stub()
    };
    const access_token = '23456789';
    const applicationAdapter = this.owner.lookup('adapter:application');

    // When
    applicationAdapter.set('session', { data: { authenticated: { access_token } } });
    applicationAdapter.authorize(xhr);

    // Then
    sinon.assert.calledWith(xhr.setRequestHeader, 'Authorization', `Bearer ${access_token}`);
  });

  it('should not set Authorization header without token ', function() {
    // Given
    const xhr = {
      setRequestHeader: sinon.stub()
    };
    const access_token = '';
    const applicationAdapter = this.owner.lookup('adapter:application');

    // When
    applicationAdapter.set('session', { data: { authenticated: { access_token } } });
    applicationAdapter.authorize(xhr);

    // Then
    sinon.assert.notCalled (xhr.setRequestHeader);
  });

  describe('#handleResponse', function() {

    let window;
    const { apiVersionHeader } = ENV.APP;

    beforeEach(function() {
      window = this.owner.lookup('service:window');
    });

    it('should set the API version in localStorage after each response', function() {
      // Given
      const applicationAdapter = this.owner.lookup('adapter:application');
      const apiVersion = '1.1.1';
      const headers = { [apiVersionHeader]: apiVersion };

      // When
      applicationAdapter.handleResponse(200, headers, {}, {});

      // Then
      expect(window.localStorage.getItem(apiVersionHeader)).to.equal(apiVersion);
    });

    it('should prompt a notification if the API version is different from the one in localStorage', function() {
      // Given
      window.localStorage.setItem(apiVersionHeader, '1.1.1');

      const applicationAdapter = this.owner.lookup('adapter:application');
      const notificationService = this.owner.lookup('service:notification-messages');
      const warningStub = sinon.stub(notificationService, 'warning');

      const newVersion = '1.1.2';
      const headers = { [apiVersionHeader]: newVersion };

      // When
      applicationAdapter.handleResponse(200, headers, {}, {});

      // Then
      expect(window.localStorage.getItem(apiVersionHeader)).to.equal(newVersion);
      expect(warningStub).to.be.calledOnce;
    });

  });

});
