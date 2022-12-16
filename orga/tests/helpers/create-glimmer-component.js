import { getContext } from '@ember/test-helpers';
import GlimmerComponentManager from '@glimmer/component/-private/ember-component-manager';

export default function createComponent(lookupPath, named = {}) {
  const { owner } = getContext();
  const { class: componentClass } = owner.factoryFor(lookupPath);
  const componentManager = new GlimmerComponentManager(owner);
  return componentManager.createComponent(componentClass, { named });
}
