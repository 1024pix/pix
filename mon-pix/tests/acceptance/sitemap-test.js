import { findAll } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-mocha';
import { authenticateByEmail } from '../helpers/authentication';
import visit from '../helpers/visit';

describe('Acceptance | Sitemap', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  describe('When visiting /plan-du-site', function() {

    beforeEach(async function() {
      await authenticateByEmail(user);
      await visit('/plan-du-site');
    });

    it('should contain a link to pix.fr/accessibilite', async function() {
      // then
      const accessibilityLink = findAll('.sitemap-items-link-resources__resource > a')[0];
      expect(accessibilityLink.getAttribute('href')).to.contains('/accessibilite');
    });

    it('should contain a link to pix.fr/conditions-generales-d-utilisation', async function() {
      // then
      const cguLink = findAll('.sitemap-items-link-resources__resource > a')[1];
      expect(cguLink.getAttribute('href')).to.contains('/conditions-generales-d-utilisation');
    });

    it('should contain a link to pix.fr/aide-accessibilite', async function() {
      // then
      const accessibilityHelpLink = findAll('a[data-test-resource-link]')[0];
      expect(accessibilityHelpLink.getAttribute('href')).to.contains('/aide-accessibilite');
    });

    it('should contain a link to pix.fr/politique-protection-donnees-personnelles-app', async function() {
      // then
      const cguPolicyLink = findAll('a[data-test-resource-link]')[1];
      expect(cguPolicyLink.getAttribute('href')).to.contains('/politique-protection-donnees-personnelles-app');
    });
  });
});
