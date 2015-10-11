import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';

import {setEntries, next, vote} from '../src/core';

describe('application logic', () => {
  describe('setEntries', () => {
    it('adds the entries to the state', () => {
      const state = Map();
      const entries = List.of('Trainspotting', '28 Days Later');
      const nextState = setEntries(state, entries);

      expect(nextState).to.equal(Map({
        entries: List.of('Trainspotting', '28 Days Later')
      }));
    });
  });

  describe('next', () => {
    it('takes the next two entries under vote', () => {
      const state = Map({
        entries: List.of('Trainspotting', '28 Days Later', 'Sunshine')
      });
      const nextState = next(state);

      expect(nextState).to.equal(Map({
        vote: Map({
          round: 1,
          pair: List.of('Trainspotting', '28 Days Later'),
        }),
        entries: List.of('Sunshine'),
      }));
    });

    it('puts winner of current vote back to entries', () => {
      const state = Map({
        vote: Map({
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 3,
            '28 Days Later': 2,
          }),
        }),
        entries: List.of('Sunshine', 'Millions', '127 Hours'),
      });
      const nextState = next(state);

      expect(nextState).to.contain.all.keys(Map({
        vote: Map({
          pair: List.of('Sunshine', 'Millions'),
        }),
        entries: List.of('127 Hours', 'Trainspotting'),
      }));
    });

    it('puts both from tied vote back to entries', () => {
      const state = Map({
        vote: Map({
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 3,
            '28 Days Later': 3
          })
        }),
        entries: List.of('Sunshine', 'Millions', '127 Hours')
      });
      const nextState = next(state);
      expect(nextState).to.contain.all.keys(Map({
        vote: Map({
          pair: List.of('Sunshine', 'Millions')
        }),
        entries: List.of('127 Hours', 'Trainspotting', '28 Days Later')
      }));
    });

    it('marks winner when one entry left', () => {
      const state = Map({
        vote: Map({
          pair: List.of('Trainspotting', '28 Days Later'),
          tally: Map({
            'Trainspotting': 4,
            '28 Days Later': 3
          })
        }),
        entries: List()
      });
      const nextState = next(state);
      expect(nextState).to.contain.all.keys(Map({
        winner: 'Trainspotting'
      }));
      expect(nextState).to.not.have.any.keys('vote');
    });
  });

  describe('vote', () => {
    it('creates a tally for the voted entry', () => {
      const state = Map({
        pair: List.of('Trainspotting', '28 Days Later'),
      });
      const nextState = vote(state, 'Trainspotting', 'voter1');

      expect(nextState).to.equal(fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        tally: {'Trainspotting': 1},
        votes: {voter1: 'Trainspotting'},
      }));

      expect(vote(state, 'Lillehammer')).to.equal(state);
    });

    it('hadles revoting', () => {
      const state = fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        tally: {
          'Trainspotting': 1,
          '28 Days Later': 2,
        },
        votes: {
          voter1: 'Trainspotting',
          voter2: '28 Days Later',
          voter3: '28 Days Later',
        },
      });
      const nextState = vote(state, '28 Days Later', 'voter1');

      expect(nextState).to.equal(fromJS({
        pair: ['Trainspotting', '28 Days Later'],
        tally: {
          'Trainspotting': 0,
          '28 Days Later': 3,
        },
        votes: {
          voter1: '28 Days Later',
          voter2: '28 Days Later',
          voter3: '28 Days Later',
        },
      }));
    });
  });
});
