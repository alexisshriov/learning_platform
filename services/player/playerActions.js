export const FETCH_PLAYERS = "player/fetchPlayers";
export const ADD_PLAYER = "player/addPlayer";
export const ADDING_PLAYER = "player/addingPlayer";
export const SET_PLAYERS = "player/setPlayers";
export const SET_PROGRESS = "player/setProgress";
export const UPDATE_EXERCISE_PROGRESS = "player/updateExerciseProgress";
export const SET_CURRENT_PLAYER = "player/setCurrentPlayer";
export const UNSET_PLAYERS_AND_PROGRESS = "player/unsetPlayersAndProgress";
export const FETCH_SEQUENCES = "player/fetchSequences";
export const SET_SEQUENCES = "player/setSequences";
export const FETCH_CHALLENGES = "player/fetchChallenges";
export const SET_CHALLENGES = "player/setChallenges";
export const UPDATE_CHALLENGE = "player/updateChallenge";
export const SET_CHALLENGE_POSITION = "player/setChallengePosition";
export const SET_CURRENT_CHALLENGE_ID = "player/setCurrentChallengeId";
export const FETCH_ASSIGNMENTS = "player/fetchAssignments";
export const SET_ASSIGNMENTS = "player/setAssignments";
export const SET_GRADE = "player/setGrade";
export const SET_AVATAR = "player/setAvatar";
export const SET_CURRENT_PLAYLIST = "player/setCurrentPlaylist";
export const SET_SINGLE_EXERCISE = "player/setSingleExercise";
export const REFRESHED_CURRENT_PLAYLIST_VIEW = "player/refreshedCurrentPlaylistView";
export const SET_SKILLMAP = "player/setSkillmap";
export const UPDATE_SKILL = "player/updateSkill";
export const SET_GIFT = "player/setGift";
export const ADD_PLAYER_ERROR = "player/addPlayerError";
export const actions = {
  fetchPlayers: () => {
    return {
      type: FETCH_PLAYERS
    };
  },
  addingPlayer: () => {
    return {
      type: ADDING_PLAYER,
    };
  },  
  addPlayer: (payload) => {
    return {
      type: ADD_PLAYER,
      payload: payload
    };
  },
  setPlayerError: (payload) => {
    return {
      type: ADD_PLAYER_ERROR,
      payload: payload
    };
  },
  setPlayers: (payload) => {
    return {
      type: SET_PLAYERS,
      payload: payload
    };
  },
  setAvatar: (payload) => {
    return {
      type: SET_AVATAR,
      payload: payload
    };
  },
  setProgress: (payload) => {
    return {
      type: SET_PROGRESS,
      payload: payload
    };
  },
  updateExerciseProgress: (payload) => {
    return {
      type: UPDATE_EXERCISE_PROGRESS,
      payload: payload
    }
  },
  setCurrentPlayer: (payload) => {
    return {
      type: SET_CURRENT_PLAYER,
      payload: payload
    };
  },
  setGrade: (payload) => {
    return {
      type: SET_GRADE,
      payload: payload
    };
  },
  unsetPlayersAndProgress: () => {
    return {
      type: UNSET_PLAYERS_AND_PROGRESS
    };
  },
  fetchSequences: () => {
    return {
      type: FETCH_SEQUENCES
    };
  },
  setSequences: (payload) => {
    return {
      type: SET_SEQUENCES,
      payload: payload
    };
  },
  fetchChallenges: () => {
    return {
      type: FETCH_CHALLENGES
    };
  },
  setChallenges: (payload) => {
    return {
      type: SET_CHALLENGES,
      payload: payload
    };
  },
  updateChallenge: (payload) => {
    return {
      type: UPDATE_CHALLENGE,
      payload: payload
    };
  },
  setChallengePosition: (payload) => {
    return {
      type: SET_CHALLENGE_POSITION,
      payload: payload
    };
  },
  setCurrentChallengeId: (payload) => {
    return {
      type: SET_CURRENT_CHALLENGE_ID,
      payload: payload
    };
  },
  fetchAssignments: () => {
    return {
      type: FETCH_ASSIGNMENTS
    };
  },
  setAssignments: (payload) => {
    return {
      type: SET_ASSIGNMENTS,
      payload: payload
    };
  },
  setCurrentPlaylist: (payload) => {
    return {
      type: SET_CURRENT_PLAYLIST,
      payload: payload
    };
  },
  setSingleExercise: (payload) => {
    return {
      type: SET_SINGLE_EXERCISE,
      payload: payload
    };
  },
  refreshedCurrentPlaylistView: () => {
    return {
      type: REFRESHED_CURRENT_PLAYLIST_VIEW
    };
  },
  setSkillMap: (payload) => {
    return {
      type: SET_SKILLMAP,
      payload: payload
    };
  },
  updateSkill: (payload) => {
    return {
      type: UPDATE_SKILL,
      payload: payload
    };
  },
  setGift: (payload) => {
    return {
      type: SET_GIFT,
      payload: payload
    };
  }
};
