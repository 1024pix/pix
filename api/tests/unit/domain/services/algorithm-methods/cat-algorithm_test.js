import { assert } from 'chai';

import {
  findMaxRewardingSkills,
  getPredictedLevel,
} from '../../../../../lib/domain/services/algorithm-methods/cat-algorithm.js';
import { buildKnowledgeElement, buildSkill, buildTube } from '../../../../tooling/domain-builder/factory/index.js';

describe('Unit | Domain | services | cat-algorithm', function () {
  let knowledgeElements;
  let predictedLevel;
  let skills;
  let tubes;

  // data used for the following tests have been extracted from production to recreate genuine simulation results
  before(function () {
    predictedLevel = 6.5;
    knowledgeElements = [
      {
        id: 167869,
        source: 'direct',
        status: 'invalidated',
        skillId: 'skill1nwDxoR0x0SCZW',
      },
      {
        id: 167870,
        source: 'inferred',
        status: 'invalidated',
        skillId: 'skill1MjpSjffZZXvh0',
      },
      {
        id: 165695,
        source: 'direct',
        status: 'validated',
        skillId: 'rec1TZRdq2lKyLEaR',
      },
      {
        id: 165703,
        source: 'direct',
        status: 'validated',
        skillId: 'rec8PgJLouOSZ17FG',
      },
      {
        id: 165715,
        source: 'direct',
        status: 'validated',
        skillId: 'recfktfO0ROu1OifX',
      },
      {
        id: 165727,
        source: 'direct',
        status: 'validated',
        skillId: 'reciF9dxvDfMUuFcb',
      },
      {
        id: 165739,
        source: 'direct',
        status: 'validated',
        skillId: 'recyCbjLUApUp06rk',
      },
      {
        id: 165751,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1aa9GlPzDG3GUP',
      },
      {
        id: 165763,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1rXqGtiKi8JLdk',
      },
      {
        id: 165775,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1xkz0CTTsal6uL',
      },
      {
        id: 165787,
        source: 'direct',
        status: 'validated',
        skillId: 'skill2fj31Yqxlb7jk6',
      },
      {
        id: 165799,
        source: 'direct',
        status: 'validated',
        skillId: 'skill15XF9tWHkxNWPm',
      },
      {
        id: 165811,
        source: 'direct',
        status: 'validated',
        skillId: 'skill135DNPBBKppVeo',
      },
      {
        id: 165307,
        source: 'direct',
        status: 'validated',
        skillId: 'rec5JQfWV9brlT8hO',
      },
      {
        id: 165319,
        source: 'direct',
        status: 'validated',
        skillId: 'recPG9ftlGZLiF0O6',
      },
      {
        id: 165331,
        source: 'direct',
        status: 'validated',
        skillId: 'recPGDVdX0LSOWQQC',
      },
      {
        id: 165343,
        source: 'direct',
        status: 'validated',
        skillId: 'recUDrhjEYqmfahRX',
      },
      {
        id: 165355,
        source: 'direct',
        status: 'validated',
        skillId: 'recZ6RUx2zcIaRAIC',
      },
      {
        id: 165367,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1ekYIy8gFHyxCV',
      },
      {
        id: 165379,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1ENXr2MZ0XZhWj',
      },
      {
        id: 165391,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1urblOxjUEbinI',
      },
      {
        id: 165403,
        source: 'direct',
        status: 'validated',
        skillId: 'skill2b3kerzZhjyp0A',
      },
      {
        id: 165415,
        source: 'direct',
        status: 'validated',
        skillId: 'rec4973AsptLwKr5f',
      },
      {
        id: 165427,
        source: 'direct',
        status: 'validated',
        skillId: 'recdnFCH9mBrDW06P',
      },
      {
        id: 165439,
        source: 'direct',
        status: 'validated',
        skillId: 'recH1pcEWLBUCqXTm',
      },
      {
        id: 165451,
        source: 'direct',
        status: 'validated',
        skillId: 'recTR73NgMRmrKRhT',
      },
      {
        id: 165463,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1DbWfXibjwaM1w',
      },
      {
        id: 165475,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1xQQ7zYfFzbmaH',
      },
      {
        id: 165487,
        source: 'direct',
        status: 'validated',
        skillId: 'skill2BxFQALqARP441',
      },
      {
        id: 165499,
        source: 'direct',
        status: 'validated',
        skillId: 'skill2rfU7dxfMwkMcr',
      },
      {
        id: 165511,
        source: 'direct',
        status: 'validated',
        skillId: 'skill2x1YhidbkYp2Pg',
      },
      {
        id: 165523,
        source: 'direct',
        status: 'validated',
        skillId: 'skill22ugx0qpvW2twf',
      },
      {
        id: 165535,
        source: 'direct',
        status: 'validated',
        skillId: 'skill29qYgQv0UPtZzI',
      },
      {
        id: 165547,
        source: 'direct',
        status: 'validated',
        skillId: 'rec9hCuo78BNiz94h',
      },
      {
        id: 165559,
        source: 'direct',
        status: 'validated',
        skillId: 'recdwoJE9Po9zdf0A',
      },
      {
        id: 165571,
        source: 'direct',
        status: 'validated',
        skillId: 'recIDXphXbneOrbux',
      },
      {
        id: 165583,
        source: 'direct',
        status: 'validated',
        skillId: 'recl2LAo6vB6BOgUd',
      },
      {
        id: 165595,
        source: 'direct',
        status: 'validated',
        skillId: 'recmoanUlDOyXexPF',
      },
      {
        id: 165607,
        source: 'direct',
        status: 'validated',
        skillId: 'recuiCzBk96GLsysI',
      },
      {
        id: 165619,
        source: 'direct',
        status: 'validated',
        skillId: 'recZQw6nVvfYg0uyB',
      },
      {
        id: 165631,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1iR2MVxDLqEIVO',
      },
      {
        id: 165643,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1TjG4RSc2Kt7uF',
      },
      {
        id: 165655,
        source: 'direct',
        status: 'validated',
        skillId: 'skill1xsn4sAgpuxhuB',
      },
      {
        id: 165667,
        source: 'direct',
        status: 'validated',
        skillId: 'skill18ySWKxgaUtP6y',
      },
      {
        id: 165679,
        source: 'direct',
        status: 'validated',
        skillId: 'skillO9IBV1NC2tNmd',
      },
    ].map(buildKnowledgeElement);
    skills = [
      {
        id: 'rec1TZRdq2lKyLEaR',
        name: '@répondreMail4',
        difficulty: 4,
      },
      {
        id: 'rec5JQfWV9brlT8hO',
        name: '@adresseElect1',
        difficulty: 1,
      },
      {
        id: 'rec8PgJLouOSZ17FG',
        name: '@spam4',
        difficulty: 4,
      },
      {
        id: 'rec9hCuo78BNiz94h',
        name: '@spam3',
        difficulty: 3,
      },
      {
        id: 'rec20khhumencjHqt',
        name: '@gestionMails5',
        difficulty: 5,
      },
      {
        id: 'rec4973AsptLwKr5f',
        name: '@communicationAsynchrone2',
        difficulty: 2,
      },
      {
        id: 'recdnFCH9mBrDW06P',
        name: '@spam2',
        difficulty: 2,
      },
      {
        id: 'recdwoJE9Po9zdf0A',
        name: '@outilsMsgélectronique3',
        difficulty: 3,
      },
      {
        id: 'recfktfO0ROu1OifX',
        name: '@netiquette4',
        difficulty: 4,
      },
      {
        id: 'recH1pcEWLBUCqXTm',
        name: '@champsCourriel2',
        difficulty: 2,
      },
      {
        id: 'recIDXphXbneOrbux',
        name: '@champsCourriel3',
        difficulty: 3,
      },
      {
        id: 'reciF9dxvDfMUuFcb',
        name: '@champsCourriel4',
        difficulty: 4,
      },
      {
        id: 'recl2LAo6vB6BOgUd',
        name: '@répondreMail3',
        difficulty: 3,
      },
      {
        id: 'recmoanUlDOyXexPF',
        name: '@gestionMails3',
        difficulty: 3,
      },
      {
        id: 'recPG9ftlGZLiF0O6',
        name: '@champsCourriel1',
        difficulty: 1,
      },
      {
        id: 'recPGDVdX0LSOWQQC',
        name: '@gestionMails1',
        difficulty: 1,
      },
      {
        id: 'recTR73NgMRmrKRhT',
        name: '@répondreMail2',
        difficulty: 2,
      },
      {
        id: 'recUaEq1tk16x66T',
        name: '@gestionMails6',
        difficulty: 6,
      },
      {
        id: 'recUDrhjEYqmfahRX',
        name: '@répondreMail1',
        difficulty: 1,
      },
      {
        id: 'recuiCzBk96GLsysI',
        name: '@adresseElect3',
        difficulty: 3,
      },
      {
        id: 'recWTGXrt4fLP2QOL',
        name: '@spam5',
        difficulty: 5,
      },
      {
        id: 'recwucYj3gElngpyL',
        name: '@netiquette6',
        difficulty: 6,
      },
      {
        id: 'recyCbjLUApUp06rk',
        name: '@gestionMails4',
        difficulty: 4,
      },
      {
        id: 'recZ6RUx2zcIaRAIC',
        name: '@outilsMsgélectronique1',
        difficulty: 1,
      },
      {
        id: 'recZQw6nVvfYg0uyB',
        name: '@communicationAsynchrone3',
        difficulty: 3,
      },
      {
        id: 'skill1aa9GlPzDG3GUP',
        name: '@conversation4',
        difficulty: 4,
      },
      {
        id: 'skill1DbWfXibjwaM1w',
        name: '@conversation2',
        difficulty: 2,
      },
      {
        id: 'skill1ekYIy8gFHyxCV',
        name: '@canal1',
        difficulty: 1,
      },
      {
        id: 'skill1ENXr2MZ0XZhWj',
        name: '@conversation1',
        difficulty: 1,
      },
      {
        id: 'skill1F8u92iXfUwcM6',
        name: '@outilsMsgélectronique6',
        difficulty: 6,
      },
      {
        id: 'skill1GkELRn1T8WDxM',
        name: '@PJ5',
        difficulty: 5,
      },
      {
        id: 'skill1iR2MVxDLqEIVO',
        name: '@canal3',
        difficulty: 3,
      },
      {
        id: 'skill1j39bcoIGvlADN',
        name: '@champsCourriel6',
        difficulty: 6,
      },
      {
        id: 'skill1kvO3wW1sZuryD',
        name: '@communicationAsynchrone7',
        difficulty: 7,
      },
      {
        id: 'skill1lFqczMT6lqm5Y',
        name: '@communicationAsynchrone5',
        difficulty: 5,
      },
      {
        id: 'skill1Ma8u52WmJfxIf',
        name: '@champsCourriel5',
        difficulty: 5,
      },
      {
        id: 'skill1MjpSjffZZXvh0',
        name: '@contacts7',
        difficulty: 7,
      },
      {
        id: 'skill1nwDxoR0x0SCZW',
        name: '@contacts5',
        difficulty: 5,
      },
      {
        id: 'skill1qaJ2VnTFJ5GJf',
        name: '@spam6',
        difficulty: 6,
      },
      {
        id: 'skill1rXqGtiKi8JLdk',
        name: '@outilsMsgélectronique4',
        difficulty: 4,
      },
      {
        id: 'skill1TjG4RSc2Kt7uF',
        name: '@outilsVisio3',
        difficulty: 3,
      },
      {
        id: 'skill1urblOxjUEbinI',
        name: '@outilsVisio1',
        difficulty: 1,
      },
      {
        id: 'skill1xkz0CTTsal6uL',
        name: '@outilsMessagerie4',
        difficulty: 4,
      },
      {
        id: 'skill1xQQ7zYfFzbmaH',
        name: '@outilsMessagerie2',
        difficulty: 2,
      },
      {
        id: 'skill1xsn4sAgpuxhuB',
        name: '@conversation3',
        difficulty: 3,
      },
      {
        id: 'skill1z5pb57z8oW19r',
        name: '@outilsMsgélectronique5',
        difficulty: 5,
      },
      {
        id: 'skill2A1myNkqAxiyKT',
        name: '@conversation5',
        difficulty: 5,
      },
      {
        id: 'skill2b3kerzZhjyp0A',
        name: '@contacts1',
        difficulty: 1,
      },
      {
        id: 'skill2BxFQALqARP441',
        name: '@adresseElect2',
        difficulty: 2,
      },
      {
        id: 'skill2fj31Yqxlb7jk6',
        name: '@canal4',
        difficulty: 4,
      },
      {
        id: 'skill2ieQwFlW3Ne9Nt',
        name: '@communicationAsynchrone6',
        difficulty: 6,
      },
      {
        id: 'skill2rfU7dxfMwkMcr',
        name: '@outilsVisio2',
        difficulty: 2,
      },
      {
        id: 'skill2x1YhidbkYp2Pg',
        name: '@canal2',
        difficulty: 2,
      },
      {
        id: 'skill12LsYS7w71E0rF',
        name: '@outilsVisio6',
        difficulty: 6,
      },
      {
        id: 'skill15XF9tWHkxNWPm',
        name: '@PJ4',
        difficulty: 4,
      },
      {
        id: 'skill18ySWKxgaUtP6y',
        name: '@PJ3',
        difficulty: 3,
      },
      {
        id: 'skill22ugx0qpvW2twf',
        name: '@PJ2',
        difficulty: 2,
      },
      {
        id: 'skill28p87p3Ot90Umv',
        name: '@répondreMail5',
        difficulty: 5,
      },
      {
        id: 'skill29qYgQv0UPtZzI',
        name: '@utiliserVisio2',
        difficulty: 2,
      },
      {
        id: 'skill135DNPBBKppVeo',
        name: '@utiliserVisio4',
        difficulty: 4,
      },
      {
        id: 'skillO9IBV1NC2tNmd',
        name: '@utiliserVisio3',
        difficulty: 3,
      },
      {
        id: 'skillQV0P5GuLMeYW7',
        name: '@spam7',
        difficulty: 7,
      },
    ].map(buildSkill);
    tubes = [
      {
        skills: [
          {
            id: 'recUDrhjEYqmfahRX',
            name: '@répondreMail1',
            difficulty: 1,
          },
          {
            id: 'recTR73NgMRmrKRhT',
            name: '@répondreMail2',
            difficulty: 2,
          },
          {
            id: 'recl2LAo6vB6BOgUd',
            name: '@répondreMail3',
            difficulty: 3,
          },
          {
            id: 'rec1TZRdq2lKyLEaR',
            name: '@répondreMail4',
            difficulty: 4,
          },
          {
            id: 'skill28p87p3Ot90Umv',
            name: '@répondreMail5',
            difficulty: 5,
          },
        ],
        name: 'répondreMail',
      },
      {
        skills: [
          {
            id: 'rec5JQfWV9brlT8hO',
            name: '@adresseElect1',
            difficulty: 1,
          },
          {
            id: 'skill2BxFQALqARP441',
            name: '@adresseElect2',
            difficulty: 2,
          },
          {
            id: 'recuiCzBk96GLsysI',
            name: '@adresseElect3',
            difficulty: 3,
          },
        ],
        name: 'adresseElect',
      },
      {
        skills: [
          {
            id: 'recdnFCH9mBrDW06P',
            name: '@spam2',
            difficulty: 2,
          },
          {
            id: 'rec9hCuo78BNiz94h',
            name: '@spam3',
            difficulty: 3,
          },
          {
            id: 'rec8PgJLouOSZ17FG',
            name: '@spam4',
            difficulty: 4,
          },
          {
            id: 'recWTGXrt4fLP2QOL',
            name: '@spam5',
            difficulty: 5,
          },
          {
            id: 'skill1qaJ2VnTFJ5GJf',
            name: '@spam6',
            difficulty: 6,
          },
          {
            id: 'skillQV0P5GuLMeYW7',
            name: '@spam7',
            difficulty: 7,
          },
        ],
        name: 'spam',
      },
      {
        skills: [
          {
            id: 'recPGDVdX0LSOWQQC',
            name: '@gestionMails1',
            difficulty: 1,
          },
          {
            id: 'recmoanUlDOyXexPF',
            name: '@gestionMails3',
            difficulty: 3,
          },
          {
            id: 'recyCbjLUApUp06rk',
            name: '@gestionMails4',
            difficulty: 4,
          },
          {
            id: 'rec20khhumencjHqt',
            name: '@gestionMails5',
            difficulty: 5,
          },
          {
            id: 'recUaEq1tk16x66T',
            name: '@gestionMails6',
            difficulty: 6,
          },
        ],
        name: 'gestionMails',
      },
      {
        skills: [
          {
            id: 'rec4973AsptLwKr5f',
            name: '@communicationAsynchrone2',
            difficulty: 2,
          },
          {
            id: 'recZQw6nVvfYg0uyB',
            name: '@communicationAsynchrone3',
            difficulty: 3,
          },
          {
            id: 'skill1lFqczMT6lqm5Y',
            name: '@communicationAsynchrone5',
            difficulty: 5,
          },
          {
            id: 'skill2ieQwFlW3Ne9Nt',
            name: '@communicationAsynchrone6',
            difficulty: 6,
          },
          {
            id: 'skill1kvO3wW1sZuryD',
            name: '@communicationAsynchrone7',
            difficulty: 7,
          },
        ],
        name: 'communicationAsynchrone',
      },
      {
        skills: [
          {
            id: 'recZ6RUx2zcIaRAIC',
            name: '@outilsMsgélectronique1',
            difficulty: 1,
          },
          {
            id: 'recdwoJE9Po9zdf0A',
            name: '@outilsMsgélectronique3',
            difficulty: 3,
          },
          {
            id: 'skill1rXqGtiKi8JLdk',
            name: '@outilsMsgélectronique4',
            difficulty: 4,
          },
          {
            id: 'skill1z5pb57z8oW19r',
            name: '@outilsMsgélectronique5',
            difficulty: 5,
          },
          {
            id: 'skill1F8u92iXfUwcM6',
            name: '@outilsMsgélectronique6',
            difficulty: 6,
          },
        ],
        name: 'outilsMsgélectronique',
      },
      {
        skills: [
          {
            id: 'recfktfO0ROu1OifX',
            name: '@netiquette4',
            difficulty: 4,
          },
          {
            id: 'recwucYj3gElngpyL',
            name: '@netiquette6',
            difficulty: 6,
          },
        ],
        name: 'netiquette',
      },
      {
        skills: [
          {
            id: 'recPG9ftlGZLiF0O6',
            name: '@champsCourriel1',
            difficulty: 1,
          },
          {
            id: 'recH1pcEWLBUCqXTm',
            name: '@champsCourriel2',
            difficulty: 2,
          },
          {
            id: 'recIDXphXbneOrbux',
            name: '@champsCourriel3',
            difficulty: 3,
          },
          {
            id: 'reciF9dxvDfMUuFcb',
            name: '@champsCourriel4',
            difficulty: 4,
          },
          {
            id: 'skill1Ma8u52WmJfxIf',
            name: '@champsCourriel5',
            difficulty: 5,
          },
          {
            id: 'skill1j39bcoIGvlADN',
            name: '@champsCourriel6',
            difficulty: 6,
          },
        ],
        name: 'champsCourriel',
      },
      {
        skills: [
          {
            id: 'skill1ENXr2MZ0XZhWj',
            name: '@conversation1',
            difficulty: 1,
          },
          {
            id: 'skill1DbWfXibjwaM1w',
            name: '@conversation2',
            difficulty: 2,
          },
          {
            id: 'skill1xsn4sAgpuxhuB',
            name: '@conversation3',
            difficulty: 3,
          },
          {
            id: 'skill1aa9GlPzDG3GUP',
            name: '@conversation4',
            difficulty: 4,
          },
          {
            id: 'skill2A1myNkqAxiyKT',
            name: '@conversation5',
            difficulty: 5,
          },
        ],
        name: 'conversation',
      },
      {
        skills: [
          {
            id: 'skill1ekYIy8gFHyxCV',
            name: '@canal1',
            difficulty: 1,
          },
          {
            id: 'skill2x1YhidbkYp2Pg',
            name: '@canal2',
            difficulty: 2,
          },
          {
            id: 'skill1iR2MVxDLqEIVO',
            name: '@canal3',
            difficulty: 3,
          },
          {
            id: 'skill2fj31Yqxlb7jk6',
            name: '@canal4',
            difficulty: 4,
          },
        ],
        name: 'canal',
      },
      {
        skills: [
          {
            id: 'skill22ugx0qpvW2twf',
            name: '@PJ2',
            difficulty: 2,
          },
          {
            id: 'skill18ySWKxgaUtP6y',
            name: '@PJ3',
            difficulty: 3,
          },
          {
            id: 'skill15XF9tWHkxNWPm',
            name: '@PJ4',
            difficulty: 4,
          },
          {
            id: 'skill1GkELRn1T8WDxM',
            name: '@PJ5',
            difficulty: 5,
          },
        ],
        name: 'PJ',
      },
      {
        skills: [
          {
            id: 'skill2b3kerzZhjyp0A',
            name: '@contacts1',
            difficulty: 1,
          },
          {
            id: 'skill1nwDxoR0x0SCZW',
            name: '@contacts5',
            difficulty: 5,
          },
          {
            id: 'skill1MjpSjffZZXvh0',
            name: '@contacts7',
            difficulty: 7,
          },
        ],
        name: 'contacts',
      },
      {
        skills: [
          {
            id: 'skill1urblOxjUEbinI',
            name: '@outilsVisio1',
            difficulty: 1,
          },
          {
            id: 'skill2rfU7dxfMwkMcr',
            name: '@outilsVisio2',
            difficulty: 2,
          },
          {
            id: 'skill1TjG4RSc2Kt7uF',
            name: '@outilsVisio3',
            difficulty: 3,
          },
          {
            id: 'skill12LsYS7w71E0rF',
            name: '@outilsVisio6',
            difficulty: 6,
          },
        ],
        name: 'outilsVisio',
      },
      {
        skills: [
          {
            id: 'skill1xQQ7zYfFzbmaH',
            name: '@outilsMessagerie2',
            difficulty: 2,
          },
          {
            id: 'skill1xkz0CTTsal6uL',
            name: '@outilsMessagerie4',
            difficulty: 4,
          },
        ],
        name: 'outilsMessagerie',
      },
      {
        skills: [
          {
            id: 'skill29qYgQv0UPtZzI',
            name: '@utiliserVisio2',
            difficulty: 2,
          },
          {
            id: 'skillO9IBV1NC2tNmd',
            name: '@utiliserVisio3',
            difficulty: 3,
          },
          {
            id: 'skill135DNPBBKppVeo',
            name: '@utiliserVisio4',
            difficulty: 4,
          },
        ],
        name: 'utiliserVisio',
      },
    ].map(buildTube);
  });

  describe('#getPredictedLevel', function () {
    it('should return expected predicted level ', async function () {
      // when
      const predictedLevel = getPredictedLevel(knowledgeElements, skills);

      // then
      assert.equal(predictedLevel, 6.5);
    });
  });

  describe('#findMaxRewardingSkills', function () {
    it('should return expected max rewarding skills', async function () {
      // given
      const expectedMaxRewardingSkills = [
        {
          id: 'skill1qaJ2VnTFJ5GJf',
          name: '@spam6',
          difficulty: 6,
        },
        {
          id: 'skill2ieQwFlW3Ne9Nt',
          name: '@communicationAsynchrone6',
          difficulty: 6,
        },
      ].map(buildSkill);

      // when / then
      assert.deepEqual(
        findMaxRewardingSkills({
          predictedLevel,
          availableSkills: skills,
          tubes,
          knowledgeElements,
        }),
        expectedMaxRewardingSkills,
      );
    });
  });
});
