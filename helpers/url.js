export const mapToObject = (map={}, url = null) => {
  url = getDefaultURL(url);
  let emptyMap = Object.keys(map).length === 0 && map.constructor === Object;
  let response = {};

  response['screen'] = getScreen(url);

  let assignmentId = getAssignmentId(url);

  if(response['screen'] === 'assignment' ) {
    response['assignment'] = {};
  }
  if(('assignment' in map && map['assignment'] ) || emptyMap && assignmentId) {
    response['assignment'] = {};
    response['assignment']['id'] = assignmentId;
  }
  if(('subject' in map && map['subject'] ) || emptyMap){
    response['subject'] = getSubject(url);
  }
  if(('grade' in map && map['grade'] ) || emptyMap){
    response['grade'] = getGrade(url);
  }
  if(('lesson' in map && map['lesson'] ) || emptyMap){
    response['lesson'] = getLesson(url);
  }
  if(('game' in map && map['game'] ) || emptyMap){
    response['game'] = getGame(url);
  }
  if(('singlePlay' in map && map['singlePlay'] ) || emptyMap ){
    response['singlePlay'] = getSinglePlay(url);
  }
  if(('challenge' in map && map['challenge'] ) || emptyMap ){
    response['challenge'] = getChallenge(url);
  }

  return response;
}

export const getScreen = (url = null) => {
  url = getDefaultURL(url);
  let response = '';

  // carve-out for single plays (like detail page embeds without GL)
  let singlePlay = url.match(/^#singlePlay.*?$/);
  if(singlePlay) {
    return 'game';
  }
  // everything else
  let subjectOnly = url.match(/^#(math|ela|typing)$/);
  let groups = url.match(/^#(math|ela|typing),(.*?)$/);
  let assignmentMatch = url.match(/^#assignment-.*?$/);
  let assignmentSelectionMatch = url.match(/^#assignments$/);
  let challengeMatch = url.match(/^#challenge.*?$/);
  let login = url.match(/^#login/);
  let assignmentArray = [];
  if(assignmentMatch) assignmentArray = assignmentMatch[0].split(',');
  // checking for assignment section
  if(assignmentArray.length === 2){
    return 'game';

  } else if(challengeMatch){
    return 'challenge';

  } else if(assignmentMatch){
    return 'assignment';

  } else if(assignmentSelectionMatch){
    return 'assignments';
  // matching the lessons section
  } else if(groups) {
    if(groups.length===3){
      let parts = groups[2].split(',');
      switch(parts.length) {
        case 1:
          return 'map';
          break;
        case 2:
          return 'lesson';
          break;
        case 3:
          return 'game';
          break;
      }
    }
  } else if(subjectOnly) {
    return 'subject';
  } else if(login) {
    return 'login';
  } else {
    // if none of them match, the screen is the current hash URL
    return url.replace('#', '');
  }
  return null;
}

export const getAssignmentId = (url = null) => {
  url = getDefaultURL(url);
  let subject = getSubject(url);
  if(subject === "assignment" ) {
    let splitUrl = url.split(',')[0];
    let gamesplit = splitUrl.split('-')
    if(splitUrl) {
      return gamesplit[1];
    } else {
      let splitUrl = url.split('-')[1];
      return splitUrl;
    }
  }
  return null;
}

export const getSubject = (url = null) => {
  url = getDefaultURL(url);
  // carve-out for single plays (like detail page embeds without GL)
  let singlePlay = url.match(/^#singlePlay.*?$/);
  if(singlePlay) {
    let parts = url.split(',');
    if(parts[1] && parts[1]==='math') return 'math';
    else if(parts[1] && parts[1]==='ela') return 'ela';
    else if(parts[1] && parts[1]==='typing') return 'typing';
    else return null;
  }
  // everything else
  if (url.match(/^#math(,([^,]*)){1,3}$/g)) return 'math';
  else if (url.match(/^#ela(,([^,]*)){1,3}$/g)) return 'ela';
  else if (url.match(/^#typing(,([^,]*)){1,3}$/g)) return 'typing';
  else if (url.match(/^#assignment-.*?$/g)) return 'assignment';
  else if (url.match(/^#challenge.*?$/g)) return 'challenge';
  else if (url.match(/^#(math|ela|typing)$/)) return url.match(/^#(math|ela|typing)$/)[1];
  else return null;
}

export const getGrade = (url = null) => {
  url = getDefaultURL(url);
  // carve-out for single plays (like detail page embeds without GL)
  let singlePlay = url.match(/^#singlePlay.*?$/);
  if(singlePlay) {
    let parts = url.split(',');
    if(parts[2] && parts[2]!=='') return parts[2];
    else return null;
  }
  // everything else
  if(url.match(/^#(math|ela|typing)(,([^,]*)){1,3}$/g)){
      let urlArray = url.split(',');
      if(urlArray.length > 1) {
        return urlArray[1];
      }
  }
  return null;
}

export const getLesson = (url = null) => {
  url = getDefaultURL(url);
  // carve-out for single plays (like detail page embeds without GL)
  let singlePlay = url.match(/^#singlePlay.*?$/);
  if(singlePlay) {
    let parts = url.split(',');
    if(parts[3] && parts[3]!=='') return parts[3];
    else return null;
  }
  // everything else
  if(url.match(/^#(math|ela|typing)(,([^,]*)){2,3}$/g)){
      let urlArray = url.split(',');
      if(urlArray.length > 2) {
        return urlArray[2];
      }
  }
  return null;
}

export const getGame = (url = null) => {
  url = getDefaultURL(url);
  // carve-out for single plays (like detail page embeds without GL)
  let singlePlay = url.match(/^#singlePlay.*?$/);
  if(singlePlay) {
    let parts = url.split(',');
    if(parts[0] && parts[0]!=='') {
      let subParts = parts[0].split(':');
      if(subParts[1]) return subParts[1];
      return null;
    }
    return null;
  }
  // everything else
  if(url.match(/^#(math|ela|typing)(,([^,]*)){3}$/g)){
      let urlArray = url.split(',');
      if(urlArray.length > 3) {
        return urlArray[3];
      }
  } else if(url.match(/^#assignment-.*?$/)){
    let urlArray = url.split(',');
    return urlArray[1];
  }
  return null;
}


export const getSinglePlay = (url = null) => {
  url = getDefaultURL(url);
  let singlePlay = url.match(/^#singlePlay.*?$/);
  if(singlePlay) {
    return true;
  }
  return false;
}

export const getChallenge = (url = null) => {
  url = getDefaultURL(url);
  let challenge = url.match(/^#challenge.*?$/);
  if(challenge) {
    return true;
  }
  return false;
}




const getDefaultURL = (url = null) => {
  if(url===null){
    if(location.hash) {
      url = location.hash;
    } else {
      // one-off fix for initial location that hasn't been sanitized yet
      let search = new URLSearchParams(location.search);
      url = search.get('path') ? '#'+search.get('path') : null;
    }
  }
  if(url===null) url="";
  return url;
}