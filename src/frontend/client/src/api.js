const API = (access_token) => {
  const baseApiUrl = "http://localhost:3000";
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  };

  return {
    get({ endpoint, options = {} }) {
      return fetch(
        `${baseApiUrl}/${endpoint}`,
        Object.assign({}, defaultOptions, options)
      ).then((data) => data.json());
    },
    post({ endpoint, options = {}, body = "" }) {
      return fetch(
        `${baseApiUrl}/${endpoint}`,
        Object.assign(
          {
            method: "POST",
            body: JSON.stringify(body),
          },
          defaultOptions,
          options
        )
      )
        .then((data) => data.json())
        .catch((err) => {
          console.log("Post caused " + err);
        });
    },
  };
};

export default API;
