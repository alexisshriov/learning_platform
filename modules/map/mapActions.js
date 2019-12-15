export const SET_CHARACTER_POSITION = "map/setCharacterPosition";
export const JUMP_TO_LESSON = "map/jumpToLesson";

export const actions = {
  setCharacterPosition: (payload) => {
    return {
      type: SET_CHARACTER_POSITION,
      payload: payload
    };
  },

  jumpToLesson: (payload) => {
    return {
      type: JUMP_TO_LESSON,
      payload: payload
    }
  }
}
