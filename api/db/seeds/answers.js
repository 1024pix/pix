'use strict';

const TABLE_NAME = 'answers';

exports.seed = function (knex, Promise) {

  knex(TABLE_NAME).del();

  return knex(TABLE_NAME).insert([{

    assessment_id: 1,
    challenge_ref: 'recdTpx4c0kPPDTtf',
    value: 'NumA = "4", NumB = "3", NumD = "2", NumC = "1"',
    created_at: new Date(),
    updated_at: new Date()
  }, {

    assessment_id: 1,
    challenge_ref: 'recge9Mkog1drln4i',
    value: 'logiciel 1 = "thunderbird", logiciel 2 = "firefox", logiciel 3 = "google"',
    created_at: new Date(),
    updated_at: new Date()
  }, {

    assessment_id: 1,
    challenge_ref: 'recUcM3s9DFvpnFqj',
    value: 'Stade de Reims  = "4", LOSC = "2"',
    created_at: new Date(),
    updated_at: new Date()
  }, {

    assessment_id: 1,
    challenge_ref: 'recwWzTquPlvIl4So',
    value: '1, 2, 5',
    created_at: new Date(),
    updated_at: new Date()
  }, {

    assessment_id: 1,
    challenge_ref: 'recT0Ks2EDgoDgEKc',
    value: '4',
    created_at: new Date(),
    updated_at: new Date()
  }, {

    assessment_id: 1,
    challenge_ref: 'recFxCIKMhdRF6C0d',
    value: '5',
    created_at: new Date(),
    updated_at: new Date()
  }]);

};
