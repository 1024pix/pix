import 'survey-core';
import 'survey-core/i18n/french';
import 'survey-creator-core/i18n/french';
import 'survey-core/survey-core.css';
import 'survey-creator-core/survey-creator-core.css';

import { action } from '@ember/object';
import Component from '@glimmer/component';
import { surveyLocalization } from 'survey-core';
import { SurveyCreator } from 'survey-creator-js';

import didInsert from '../modifiers/did-insert';

export default class FormsCreator extends Component {
  @action
  initFormsCreator() {
    surveyLocalization.supportedLocales = ['en', 'fr'];
    surveyLocalization.defaultLocale = 'fr';

    const creatorOptions = {
      autoSaveEnabled: true,
      collapseOnDrag: true,
      showTranslationTab: true,
    };

    const defaultJson = {
      pages: [
        {
          name: 'Name',
          elements: [
            {
              name: 'FirstName',
              title: 'Enter your first name:',
              type: 'text',
            },
            {
              name: 'LastName',
              title: 'Enter your last name:',
              type: 'text',
            },
          ],
        },
      ],
    };

    const creator = new SurveyCreator(creatorOptions);
    creator.locale = 'fr';
    creator.text = window.localStorage.getItem('survey-json') || JSON.stringify(defaultJson);
    creator.saveSurveyFunc = (saveNo, callback) => {
      window.localStorage.setItem('survey-json', creator.text);
      callback(saveNo, true);
    };

    const myContainer = document.getElementById('forms-creator');
    myContainer.innerHTML = 'couucou'; // Clear any existing content
    console.log('Survey Creator initialized', creator.render);
    creator.render(document.getElementById('forms-creator'));
  }

  <template>
    <h1>Forms Creator</h1>
    <p>Welcome to the Forms Creator page!</p>
    <p>Here you can create and manage forms for your application.</p>
    <p>Use the navigation menu to access different sections of the Forms Creator.</p>

    <div id="forms-creator" {{didInsert this.initFormsCreator}}></div>
  </template>
}
