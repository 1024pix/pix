import { irregular } from '@warp-drive/utilities/string';

export function initialize() {
  irregular('badge-criterion', 'badge-criteria');
}

export default {
  name: 'custom-inflector-rules',
  initialize,
};
