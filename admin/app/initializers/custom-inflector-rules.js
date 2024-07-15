import Inflector from 'ember-inflector';

export function initialize() {
  const inflector = Inflector.inflector;

  inflector.irregular('badge-criterion', 'badge-criteria');
}

export default {
  name: 'custom-inflector-rules',
  before: 'ember-cli-mirage',
  initialize,
};
