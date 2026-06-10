export const state = {
  currentUser: {
    name: "SuperAdmin",
    role: "SUPER_ADMIN"
  },
  currentModule: "platform-dashboard",
  currentClub: null
};

export function setCurrentModule(moduleKey) {
  state.currentModule = moduleKey;
}
