const bcrypt = require("bcrypt");

async function run() {
  const password = "admin@123";   // new password you want
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log(hash);
}

run();
