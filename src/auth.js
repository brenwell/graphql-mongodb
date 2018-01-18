const FB = require('fb')
const blacklist = require('express-jwt-blacklist');
const ROLES = require('./roles')
const { findOrCreateUser } = require('./db')
const { encode } = require('./token')

/**
 * Setup facebook
 *
 * @param  {<type>}  opts  The options
 */
function configure(opts)
{
    FB.options(opts)
}

/**
 * Authorize a user via facebook
 *
 * @param  {<type>}   accessToken  The access token
 * @return {Promise}  { description_of_the_return_value }
 */
async function authorizeFacebookUser(accessToken)
{
    const request = {
        fields: ['id', 'name', 'email', 'gender', 'birthday', 'picture'],
        access_token: accessToken
    }

    const profile = await FB.api('me', request)

    const forInsert = {
        name: profile.name,
        email: profile.email,
        gender: profile.gender,
        birthday: profile.birthday,
        picture: profile.picture.data.url,
        facebookId: profile.id,
        facebookEmail: profile.email,
        role: ROLES.user,
    }

    const dbResponse = await findOrCreateUser(forInsert)

    const user = dbResponse.value

    const token = encode(user)

    return { ...user, token }
}

/**
 * Logout
 */
function deauthorizeUser(user)
{
    blacklist.revoke(user)
}

/**
 * authenticate
 *
 * @param  {number}    role  The role
 * @param  {Function}  fn    The function
 * @return {<type>}    { description_of_the_return_value }
 */
function authenticate(role, fn)
{
    function call(...args)
    {
        if ( !args || args[2] || !args[2].user )
        {
            throw new Error('User is not AUTHENTICATED');
            return
        }

        if(!user || role > user.role)
        {
            throw new Error('User is not AUTHORIZED');
            return
        }

        fn(...args)
    }

    return call
}

module.exports = {
    configure,
    authorizeFacebookUser,
    deauthorizeUser,
    authenticate
}
