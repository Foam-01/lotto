const config = {
  apiPath: "http://localhost:3000",
  headers: () => {
    return {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    };
  },
};
export default config;
