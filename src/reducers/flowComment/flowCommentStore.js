const defaultStore = {

};


export default function flowCommentStore(state = defaultStore, {type, payload}) {

  switch(type) {
    case 'save':
      return {...state, ...payload};
  }
  return state;
}