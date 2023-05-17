import { getContext } from '@ember/test-helpers';
import GlimmerComponentManager from '@glimmer/component/-private/ember-component-manager';
import { importSync } from '@embroider/macros';

export default function createComponent(lookupPath, named = {}) {
  const { owner } = getContext();
  const componentClass = importSync(`../../components/${lookupPath}`).default;
  const componentManager = new GlimmerComponentManager(owner);
  return componentManager.createComponent(componentClass, { named });
}
