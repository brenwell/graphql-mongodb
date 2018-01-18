// How to make internal graph calls


const { request } = require('graphql-request')

const mut = `mutation {
    createUser(name: "${profile.displayName}", facebookId: "${profile.id}", facebookUsername: "${profile.username}") {
        _id
        name
        facebookId
        facebookUsername
    }
}
`

request('http://localhost:3000/graphql', mut)
.then(result => {
     done(null, result.createUser);
}).catch(error => {
    console.log(error)
    done(error);
});