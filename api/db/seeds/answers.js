'use strict';

const TABLE_NAME = 'answers';

exports.seed = function (knex, Promise) {

  return knex(TABLE_NAME).del().then(() => {

    return knex(TABLE_NAME).insert([{

      assessmentId: 1,
      challengeRef: 'recdTpx4c0kPPDTtf',
      value: 'NumA = "4", NumB = "3", NumD = "2", NumC = "1"'
    }, {

      assessmentId: 1,
      challengeRef: 'recge9Mkog1drln4i',
      value: 'logiciel 1 = "thunderbird", logiciel 2 = "firefox", logiciel 3 = "google"'
    }, {

      assessmentId: 1,
      challengeRef: 'recUcM3s9DFvpnFqj',
      value: 'Stade de Reims  = "4", LOSC = "2"'
    }, {

      assessmentId: 1,
      challengeRef: 'recwWzTquPlvIl4So',
      value: '1, 2, 5'
    }, {

      assessmentId: 1,
      challengeRef: 'recT0Ks2EDgoDgEKc',
      value: '4'
    }, {

      assessmentId: 1,
      challengeRef: 'recFxCIKMhdRF6C0d',
      value: '5'
    }]);

  });

};
