// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';

// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    onToggleAllSelection() {
      this.toggleAllSelection();
    },
  },
});
