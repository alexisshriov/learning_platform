export const CLICK_JUMP_TO_GAME = "assignments/clickJumpToGame";

export const actions = {
  clickJumpToGame: (payload) => {
    return {
      type: CLICK_JUMP_TO_GAME,
      payload: payload
    };
  }
}
