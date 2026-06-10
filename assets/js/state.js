export const state = {
  currentUser: null,
  currentModule: "platform-dashboard",
  currentClub: null
};

export function setCurrentUser(user) {
  state.currentUser = user;
}

export function setCurrentModule(moduleKey) {
  state.currentModule = moduleKey;
}
