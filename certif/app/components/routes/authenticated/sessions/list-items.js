import Component from '@ember/component';
import { computed } from '@ember/object';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default Component.extend({
  sortingOrder: SORTING_ORDER,
  sortedSessions: computed.sort('sessions', 'sortingOrder'),
  columns: null,

  init() {
    this._super(...arguments);
    this.set('columns', [
      {
        name: 'ID session',
        valuePath: 'id',
        width: 8
      },
      {
        name: 'Nom du site',
        valuePath: 'address',
        width: 40
      },
      {
        name: 'Salle',
        valuePath: 'room',
        width: 30
      },
      {
        name: 'Date',
        valuePath: 'date',
        isDate: true,
        width: 10
      },
      {
        name: 'Heure',
        valuePath: 'time',
        isHour: true,
        width: 5
      },
      {
        name: 'Surveillant',
        valuePath: 'examiner',
        width: 30
      },
      {
        name: 'Code d\'accès',
        valuePath: 'accessCode',
        width: 10
      },
      {
        name: 'Modifier',
        valuePath: 'id',
        isUpdate: true,
        width: 5
      }
    ]);
  },
});
