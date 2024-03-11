import Component from '@glimmer/component';

import { CONNECTION_TYPES } from '../../helpers/connection-types';

export default class TableRow extends Component {
  get connectionTypes() {
    return CONNECTION_TYPES;
  }
}
