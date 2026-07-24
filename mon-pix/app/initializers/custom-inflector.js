import { irregular } from '@warp-drive/utilities/string';

export function initialize() {
  irregular('organization-to-join', 'organizations-to-join');
}

export default {
  name: 'custom-inflector-rules',
  initialize,
};
