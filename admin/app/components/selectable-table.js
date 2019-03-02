import ModelsTable from 'ember-models-table/components/models-table';
import layout from 'ember-models-table/templates/components/models-table';

export default ModelsTable.extend({
  layout,
  actions: {
    toggleAllSelection() {
      let selectedItems = this.selectedItems;
      let data = this.data;
      const allSelectedBefore = selectedItems.get('length') === data.get('length');
      this.selectedItems.clear();
      if (!allSelectedBefore) {
        this.selectedItems.pushObjects(data.toArray());
      }
      this.userInteractionObserver();
    }
  }
});
