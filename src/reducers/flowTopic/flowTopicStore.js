const defaultState = {

    topic: {}
  
};

export default function flowTopicStore(state = defaultState, {type, payload}) {

    switch(type) {
        case 'save': 
        return {...payload};
    }
    return state;
}