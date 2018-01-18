const express = require('express')
const authRouter = express.Router()
const passport = require('passport')
const FacebookTokenStrategy = require('passport-facebook-token')
const cache = require('./cache')
const { encode } = require('./token')
const {findOrCreateUser} = require('./db')
const blacklist = require('express-jwt-blacklist');

function authSetup(opts)
{
    passport.use(new FacebookTokenStrategy(opts,
        function(accessToken, refreshToken, profile, done)
        {
            const user = {
                name: profile.displayName,
                email: profile.emails[0].value,
                facebookId: profile.id,
                facebookEmail: profile.emails[0].value,
                facebookUsername: profile.displayName,
                facebookFirstName: profile.name.givenName,
                facebookLastName: profile.name.familyName,
            }

            findOrCreateUser(user, done)
        }))

    return passport
}

authRouter.get('/facebook/token',
    passport.authenticate('facebook-token', { session: false }),
    function (req, res) {
        if (req.user)
        {
            console.log('login',req.user.value)

            const token = encode(req.user.value)

            res.status(200).json( {
                success : true,
                message : "User logged in",
                token: token,
                user: req.user
            });
        }
        else
        {
            res.status(401).json( {
                success : false,
                message : "User not logged in",
            });
        }
    }
);

authRouter.get( "/logout", ( req, res ) => {

    console.log('logout',req.user)

    blacklist.revoke(req.user)

    res.json( {
         success : true,
         message : "User logged out",
    });
} );

authRouter.get( "/protected", ( req, res ) => {
    res.json( {
         success : true,
         message : "You have access",
    });
} );

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
    authSetup,
    authRouter
}
