import ContentBackdrop from 'ember-side-menu/components/content-backdrop';

export default ContentBackdrop.extend({

  touchStart() {
    this.get('sideMenu').close();
  }
});
