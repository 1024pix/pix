import { getContext } from '@ember/test-helpers';
import GlimmerComponentManager from '@glimmer/component/-private/ember-component-manager';

export default function createPodsComponent(lookupPath, named = {}) {
  const { owner } = getContext();
  const result = owner.factoryFor(`component:${lookupPath}`);
  const componentClass = result.class;
  const componentManager = new GlimmerComponentManager(owner);
  return componentManager.createComponent(componentClass, { named });
}
