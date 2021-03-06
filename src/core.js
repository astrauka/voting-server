import {List, Map} from 'immutable';

export const INITIAL_STATE = Map();

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
  if(entries.size === 1) {
    return state.remove('entries')
                .remove('vote')
                .set('winner', entries.first());
  } else {
    return state.merge({
      vote: Map({
        pair: entries.take(2),
        round: state.getIn(['vote', 'round'], 0) + 1,
      }),
      entries: entries.skip(2),
    });
  }
}

function removePreviousVote(voteState, voter) {
  const previousEntry = voteState.getIn(['votes', voter]);
  if (previousEntry) {
    return voteState.updateIn(['tally', previousEntry], t => t - 1)
                    .removeIn(['votes', voter]);
  } else {
    return voteState;
  }
}

function addVote(voteState, entry, voter) {
  return voteState
    .setIn(['votes', voter], entry)
    .updateIn(['tally', entry], 0, t => t + 1);
}

export function vote(voteState, entry, voter) {
  if (!voteState.get('pair').includes(entry)) {
    return voteState;
  }

  return addVote(
    removePreviousVote(voteState, voter),
    entry,
    voter
  );
}
