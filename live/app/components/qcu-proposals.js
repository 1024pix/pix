import Ember from 'ember';
import _ from 'lodash/lodash';

function _uncheckAllRadioButtons() {
  this.$(':radio').prop('checked', false);
}

function _checkAgainTheSelectedOption(index) {
  this.$(`:radio:nth(${index})`).prop('checked', true);
}

function _replaceUndefinedOrNullValueWithFalseValue(groups) {
  return _.map(groups, (item) => {
    if (item[1]) {
      return [item[0], true];
    } else {
      return [item[0], false];
    }
  });
}

export default Ember.Component.extend({

  tagName: 'div',

  labeledRadios: Ember.computed('proposals', 'answers', function() {
    let result = _.zip(this.get('proposals'), this.get('answers'));
    result = _replaceUndefinedOrNullValueWithFalseValue(result);
    return result;
  }),

  actions: {
    radioClicked: function(index) {
      _uncheckAllRadioButtons.call(this);
      _checkAgainTheSelectedOption.call(this, index);
      this.sendAction('answerChanged');
    }
  }

});
