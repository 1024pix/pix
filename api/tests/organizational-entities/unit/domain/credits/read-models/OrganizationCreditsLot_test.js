import { expect } from 'chai';

import { OrganizationCreditsLot } from '../../../../../../src/organizational-entities/domain/credits/read-models/OrganizationCreditsLot.js';

describe('Unit | Organizational Entities | Domain | Credits | Read-models | OrganizationCreditsLot', function () {
  const consumption = {
    organizationLearnerId: 1,
    firstName: 'Lucie',
    lastName: 'Fer',
    consumedAt: new Date('2026-02-01'),
  };

  it('computes consumed and available counts from consumptions', function () {
    // given
    const lot = new OrganizationCreditsLot({
      id: 1,
      count: 10,
      activationDate: new Date('2026-01-01'),
      expirationDate: new Date('2999-12-31'),
      reference: 'REF',
      consumptions: [consumption, { ...consumption, organizationLearnerId: 2 }],
    });

    // then
    expect(lot.consumedCount).to.equal(2);
    expect(lot.availableCount).to.equal(8);
  });

  it('defaults consumptions to an empty list', function () {
    // given
    const lot = new OrganizationCreditsLot({
      id: 1,
      count: 5,
      activationDate: new Date('2026-01-01'),
      expirationDate: new Date('2999-12-31'),
      reference: 'REF',
    });

    // then
    expect(lot.consumptions).to.deep.equal([]);
    expect(lot.availableCount).to.equal(5);
  });

  context('#status', function () {
    it('returns ACTIVE when now is between activation and expiration dates', function () {
      // given
      const lot = new OrganizationCreditsLot({
        id: 1,
        count: 1,
        activationDate: new Date('2020-01-01'),
        expirationDate: new Date('2999-12-31'),
        reference: 'REF',
      });

      // then
      expect(lot.status).to.equal('ACTIVE');
    });

    it('returns PENDING when activation date is in the future', function () {
      // given
      const lot = new OrganizationCreditsLot({
        id: 1,
        count: 1,
        activationDate: new Date('2998-01-01'),
        expirationDate: new Date('2999-12-31'),
        reference: 'REF',
      });

      // then
      expect(lot.status).to.equal('PENDING');
    });

    it('returns EXPIRED when expiration date is in the past', function () {
      // given
      const lot = new OrganizationCreditsLot({
        id: 1,
        count: 1,
        activationDate: new Date('2020-01-01'),
        expirationDate: new Date('2021-01-01'),
        reference: 'REF',
      });

      // then
      expect(lot.status).to.equal('EXPIRED');
    });
  });
});
