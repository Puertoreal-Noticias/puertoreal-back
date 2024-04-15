import { USERS_BBDD } from "../bbdd.js";

const checkEmailPassword = (email, password) => {
  const user = USERS_BBDD.find((user) => {
    return user.email === email;
  });
  if (!user) throw new Error();

  if (user.password !== password) throw new Error();
  return user;
};
export default checkEmailPassword;
