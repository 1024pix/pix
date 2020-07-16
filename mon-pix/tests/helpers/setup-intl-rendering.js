import setupIntl from './setup-intl';
import { setupRenderingTest } from 'ember-mocha';

export default function setupIntlRenderingTest() {
  setupRenderingTest();
  setupIntl();
}
