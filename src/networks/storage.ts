const LOCAL_STORAGE = {
  SET: (token: string) => {
    return localStorage.setItem("token", token);
  },

  GET: () => {
    return localStorage.getItem("token");
  },

  REMOVE: () => {
    return localStorage.removeItem("token");
  },
};

export default LOCAL_STORAGE;
