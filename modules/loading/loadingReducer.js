import { LOADING_FINISHED, LOADING_CHILD_STARTED, LOADING_CHILD_FINISHED } from './loadingActions';

const initialState = {
  loading: true,
  loadingText: undefined
};

export const loading = (state = initialState, action) => {

  switch (action.type) {
    case LOADING_FINISHED:
      return {...state, loading: false, addingChild: false, loadingText:undefined};

    case LOADING_CHILD_STARTED:
      return {...state, addingChild: true, loadingText:action.payload.loadingText};

    case LOADING_CHILD_FINISHED:
      return {...state, addingChild: false, loadingText:undefined};

    default:
      return state;
  }
};

export default loading;
