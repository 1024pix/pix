import Ember from 'ember';

// borrowed from https://emberigniter.com/how-to-equals-conditional-comparison-handlebars/
const eq = (params) => params[0] === params[1];
export default Ember.Helper.helper(eq);
