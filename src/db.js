const {MongoClient} = require('mongodb')

let _Users

/**
 * Connect to mongo db
 *
 * @param  {string}   MONGO_URL  The mongo url
 * @return {Promise}  { description_of_the_return_value }
 */
async function setup(MONGO_URL)
{
    const db = await MongoClient.connect(MONGO_URL)

    const Users = db.collection('users')
    const Posts = db.collection('posts')
    const Comments = db.collection('comments')

    _Users = Users

    return {
        Users,
        Posts,
        Comments,
    }
}

function findOrCreateUser(user, cb)
{
    _Users.findAndModify(
        {facebookId: user.facebookId},  // query
        [['_id','asc']],                // sort
        {$setOnInsert: user},           // update
        {new: true,upsert: true},       // options
        cb                              // callback
    );
}

module.exports = {
    setup,
    findOrCreateUser
}

