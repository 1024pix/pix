import setupIntl from './setup-intl';
import { setupRenderingTest } from 'ember-mocha';

export default function setupIntegration() {
  setupRenderingTest();
  setupIntl();
}
