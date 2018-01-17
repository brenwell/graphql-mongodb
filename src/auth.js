const express = require('express')
const auth = express.Router()
const passport = require('passport')
const FacebookStrategy = require('passport-facebook')
// const { request } = require('graphql-request')

function authSetup(opts, getUserById, getOrCreateUser)
{
    passport.use(new FacebookStrategy(opts,
        function(accessToken, refreshToken, profile, done) {
            getOrCreateUser({
                facebookId: profile.id,
                name: profile.displayName
            }, done)

        }))

    passport.serializeUser(function(user, done) {
        console.log('serializeUser',user)
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        console.log('deserializeUser',id)
        getUserById(id, done)
    });

    return passport
}

auth.get('/facebook', passport.authenticate('facebook',{ scope: ['user_friends'] }));

auth.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
});


module.exports = {
    authSetup,
    auth
}


// const mut = `mutation {
//     createUser(name: "${profile.displayName}", facebookId: "${profile.id}", facebookUsername: "${profile.username}") {
//         _id
//         name
//         facebookId
//         facebookUsername
//     }
// }
// `

// request('http://localhost:3000/graphql', mut)
// .then(result => {
//      done(null, result.createUser);
// }).catch(error => {
//     console.log(error)
//     done(error);
// });