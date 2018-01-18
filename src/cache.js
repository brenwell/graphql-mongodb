const redis = require("redis")

const client = redis.createClient({
    db: 6
})

console.log('creating redis client')

function get(key,cb)
{
    client.get(key, cb);
}

function set(key, value, exp = 86400) // 1 day
{
    return client.set(key, value, 'EX', exp);
}

function del(key,)
{
    return client.del(key);
}


module.exports = {
    get,
    set,
    del
}

