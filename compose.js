function doIt(a,b,c,d)
{
    console.log('doing it', a,b,c,d)
}

function auth(fn)
{
    function call(...args) {
        const c = args[2]
        if (c && c.token) fn(...args)
    }

    return call
}

const authDoit = auth(doIt)

authDoit(1,'aaa',{token: 'hello'})