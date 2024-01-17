const User = require('./models/user');

async function test() {
    const data = await User.getByUsername('a');
    console.log(data);
}

test();