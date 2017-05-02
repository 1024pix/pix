import Ember from 'ember';

const CourseItem = Ember.Component.extend({

  course: null,

  tagName: 'article',
  classNames: ['course-item', 'rounded-panel'],
  attributeBindings: ['tabindex'],
  tabindex: 0,

  imageUrl: Ember.computed('course', function () {
    const imageUrl = this.get('course.imageUrl');
    return imageUrl ? imageUrl : '/images/course-default-image.png';
  }),

  actions: {
    startCourse(course) {
      this.sendAction('startCourse', course);
    }
  }

});

export default CourseItem;
