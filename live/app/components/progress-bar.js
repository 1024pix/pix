import Ember from 'ember';

const ProgressBar = Ember.Component.extend({});

ProgressBar.reopenClass({
  positionalParams: ['progress']
});

export default ProgressBar;
