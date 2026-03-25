const users = [];

function publicUser(u){
    const {passwordHash, ...rest} = u;
    return rest;
};

module.exports = {users, publicUser};