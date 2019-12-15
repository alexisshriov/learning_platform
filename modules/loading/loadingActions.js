export const LOADING_FINISHED = "loading/finished";
export const LOADING_CHILD_STARTED = "loading/started";
export const LOADING_CHILD_FINISHED = "loading/childFinished";

export const actions = {
  loadingFinished: () => {
    return {
      type: LOADING_FINISHED,
    };
  },
  loadingChildStarted: (payload) => {
    return {
      type: LOADING_CHILD_STARTED,
      payload: payload,
    };
  },

  loadingChildFinished: () => {
    return {
      type: LOADING_CHILD_FINISHED,
    };
  },
};
