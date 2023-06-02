const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const password = '123';
const hash = bcrypt.hashSync(password, salt);
console.log(hash);
const userEntered = '123';
const validated = bcrypt.compareSync(userEntered, hash);
console.log(`was ${userEntered} a match?`, validated);