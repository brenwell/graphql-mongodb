const { get, set, del } = require('./cache')
const { encode, decode } = require('./token')
const parseBearerToken = require('parse-bearer-token');

/**
 * Create and store a token in cache
 *
 * @param  {<type>}  user  The user
 */
function getAuthorizedToken(user)
{
    const token = encode(user)
    set(token, 'true')
    return token
}


/**
 * Middlewar that determines if token is authorized.
 *
 * @param  {<type>}    req   The request
 * @param  {<type>}    res   The resource
 * @param  {Function}  next  The next
 * @return {boolean}   True if token authorized, False otherwise.
 */
async function isTokenAuthorized( req, res, next )
{
    const user = await getUserFromReq(req)

    if(!user)
    {
        sendUnAuth(res)
        return
    }

    req.user = user

    return next();
}

/**
 * Middleware to destroy a session
 *
 * @param  {<type>}    req   The request
 * @param  {<type>}    res   The resource
 * @param  {Function}  next  The next
 * @return {<type>}    { description_of_the_return_value }
 */
function deauthorizeToken(req, res, next)
{
    const token = parseBearerToken(req)

    if(!token) {
        sendUnAuth(res)
        return
    }

    del(token)

    next()
}

/**
 * Gets the user from request and validates it
 *
 * @param  {<type>}    req  The request
 * @param  {Function}  cb   { parameter_description }
 * @return {<type>}    The user from request.
 */
async function getUserFromReq(req)
{
    const token = parseBearerToken(req)

    if (!token) return

    return await getUserFromToken(token)
}

/**
 * Gets the user from token.
 *
 * @param  {<type>}    token  The token
 * @param  {Function}  cb     { parameter_description }
 */
function getUserFromToken(token)
{
    return new Promise((resolve) =>
    {
        get(token, (err, state) =>
        {
            if ( err || !state || state !== 'true' )
            {
                resolve()
                return
            }

            decode( token, (err, user) => {
                if(err || !user) {
                    del(token)
                    resolve()
                    return
                }

                req.user = user
                resolve(user)
            });
        })
    })
}

/**
 * Helper to sends an un authorized responses.
 *
 * @param  {<type>}  res  The resource
 */
function sendUnAuth(res)
{
    res.status( 401 ).send( {
        success : false,
        message : "User not logged in",
    } );
}

module.exports = {
    getAuthorizedToken,
    isTokenAuthorized,
    deauthorizeToken,
    getUserFromReq,
    getUserFromToken,
}
