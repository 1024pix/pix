import Ember from 'ember';

const AppMenu = Ember.Component.extend({

  defaultItems : [
    {
      title: 'Le projet',
      href: '/projet'
    }
  ],

  menuData: Ember.computed('items.[]', function(){
    return (typeof this.get('items') != 'undefined')? this.get('items') : this.get('defaultItems');
  })

});

AppMenu.reopenClass({
  positionalParams: 'items'
});

export default AppMenu;
