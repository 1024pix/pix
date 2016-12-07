import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Component.extend({

  tagName: 'div',

  labeledCheckboxes: Ember.computed('proposals', 'answers', function() {
    /*
    * First merge 2 proposals, proposals fix the length of the 2-dimensionals array,
    * Therefore, there might be value that are undefined
    *  - [['prop 1', false], ['prop 2', true], ['prop 3', undefined], ['prop 4', undefined]]
    */
    let result = _.zip(this.get('proposals'), this.get('answers'));
    /*
    * Now convert null or undefined value into explicit boolean false value
    *  - [['prop 1', false], ['prop 2', true], ['prop 3', false], ['prop 4', false]]
    */
    result = _.map(result, (item) => {
      if (item[1]) {
        return [item[0], true];
      } else {
        return [item[0], false];
      }
    });
    return result;
  }),

  actions: {
    checkboxClicked: function() {
      this.sendAction('answerChanged');
    }
  }

});
