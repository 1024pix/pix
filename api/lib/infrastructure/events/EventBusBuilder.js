import { EventBus } from './EventBus.js';
import * as dependenciesBuilder from './EventHandlerDependenciesBuilder.js';

function build() {
  const eventBus = new EventBus(dependenciesBuilder);
  return eventBus;
}

export { build };
