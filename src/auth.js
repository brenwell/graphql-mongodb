const express = require('express')
const authRouter = express.Router()
const passport = require('passport')
const FacebookTokenStrategy = require('passport-facebook-token')
const cache = require('./cache')
const session = require('./session')
const {findOrCreateUser} = require('./db')

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
            const token = session.getAuthorizedToken(req.user)

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

authRouter.get( "/logout", session.deauthorizeToken, ( req, res ) => {

    req.logout();

    res.json( {
         success : true,
         message : "User logged out",
    });
} );

authRouter.get( "/protected", session.isTokenAuthorized, ( req, res ) => {
    res.json( {
         success : true,
         message : "You have access",
    });
} );


module.exports = {
    authSetup,
    authRouter
}
