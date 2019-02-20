import ModelsTable from 'ember-models-table/components/models-table';
import layout from 'ember-models-table/templates/components/models-table';

export default ModelsTable.extend({
  layout,
  actions:{
    toggleAllSelection() {
      let selectedItems = this.get('selectedItems');
      let data = this.get('data');
      const allSelectedBefore = selectedItems.get('length') === data.get('length');
      this.get('selectedItems').clear();
      if(!allSelectedBefore) {
        this.get('selectedItems').pushObjects(data.toArray());
      }
      this.userInteractionObserver();
    }
  }
});
