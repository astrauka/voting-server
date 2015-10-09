import {List, Map} from 'immutable';

export const INITIAL_STATE = Map({
  round: 1,
});

export function setEntries(state, entries) {
  return state.set('entries', List(entries));
}

function getWinners(vote) {
  if (!vote) return [];
  const [a, b] = vote.get('pair');
  const aVotes = vote.getIn(['tally', a], 0);
  const bVotes = vote.getIn(['tally', b], 0);
  if      (aVotes > bVotes)  return [a];
  else if (aVotes < bVotes)  return [b];
  else                       return [a, b];
}

export function next(state) {
  const entries = state.get('entries')
    .concat(getWinners(state.get('vote')));
  const nextState = state.update('round', 1, (round) => round + 1);

  if(entries.size === 1) {
    return nextState.remove('entries')
                    .remove('vote')
                    .set('winner', entries.first());
  } else {
    return nextState.merge({
      vote: Map({
        pair: entries.take(2),
      }),
      entries: entries.skip(2),
    });
  }
}

export function vote(voteState, entry) {
  if (!voteState.get('pair').includes(entry)) {
    return voteState;
  }

  return voteState.updateIn(
    ['tally', entry],
    0,
    tally => tally + 1
  );
}
