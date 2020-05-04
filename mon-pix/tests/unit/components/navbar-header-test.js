import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import sinon from 'sinon';

describe('Unit | Component | Navbar Header Component', function() {
  setupTest();

  let component;

  it('should have a frenchDomainExtension when the current domain contains pix.fr', function() {
    component = createGlimmerComponent('component:navbar-header');
    component.currentDomain = { getExtension: sinon.stub().returns('fr') };

    const domainExtension = component.isFrenchDomainExtension;

    expect(domainExtension).to.equal(true);
  });

  it('should not have frenchDomainExtension when the current domain contains pix.org', function() {
    component = createGlimmerComponent('component:navbar-header');
    component.currentDomain = { getExtension: sinon.stub().returns('org') };

    const domainExtension = component.isFrenchDomainExtension;

    expect(domainExtension).to.equal(false);
  });
});
