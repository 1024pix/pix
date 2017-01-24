import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | app menu', function() {
  setupComponentTest('app-menu', {
    integration: true
  });

  function addItemsToMenu(component,items){
    component.set('items',items);
  }

  function renderAppMenu(component) {
    component.render(hbs`{{app-menu items}}`);
  }

  describe('Test render menu item or not according to item', function(){
    it('Should not component App-menu with no item', function(){
      //Given
      addItemsToMenu(this,[]);
      //When
      renderAppMenu(this);
      //then
      expect(this.$('.app-menu__item > a').text()).to.be.empty;
    });

    it('Should render component App-menu with one or multiple items', function(){
      //Given
      addItemsToMenu(this, [
        {
          title: 'projet',
          href: '/projet'
        },
        {
          title: 'menu2',
          href: '/about'
        },
      ]);
      //When
      renderAppMenu(this);

      //then
      const itemsLength = this.$().find('.app-menu__item').get('length');
      expect(itemsLength).to.equal(2);

      const firstItem = this.$().find('.app-menu__item > a').eq(0);
      expect(firstItem.text().trim()).to.equal('projet');
      expect(firstItem.prop('href')).to.contain('/projet');
    });

  });

});
