import Component from '@glimmer/component';
import pageTitle from 'ember-page-title/helpers/page-title';
import Assessments from 'mon-pix/components/assessments/assessments';

export default class AssessmentsTemplate extends Component {
  constructor(...args) {
    super(...args);
    console.log('assessments template');
  }
  <template>
    {{pageTitle @model.title}}

    <Assessments @assessment={{@model}}>
      {{outlet}}
    </Assessments>
  </template>
}
