import {Map, List, fromJS} from 'immutable';
import {expect} from 'chai';

import makeStore from '../src/store';

describe('makeStore', () => {
  it('is a redux store', () => {
    const store = makeStore();
    const entries = List.of('Trainspotting', '28');
    expect(store.getState()).to.equal(Map({round: 1}));

    store.dispatch({
      type: 'SET_ENTRIES',
      entries: entries
    });

    expect(store.getState()).to.equal(fromJS({
      entries: entries,
      round: 1,
    }));
  });
});
