const generateRandomString = function () {
    // generate a random number between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000);
}

const createNewUser = function (email, password) {
    return {
        id: generateRandomString(),
        email,
        password
    };
}

const findUserByEmail = function (users, email) {
    for (const userKey of Object.keys(users)) {
        if (users[userKey].email === email) {
            return users[userKey];
        }
    }

    return null;
}

const getValidatedUser = function (users, email, password) {
    const user = findUserByEmail(users, email);
    if (!user || user.password !== password) {
        return null;
    }

    return user;
}

module.exports = {generateRandomString, createNewUser, findUserByEmail, getValidatedUser};