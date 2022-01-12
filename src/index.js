const express = require('express')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')

const path = require('path')

const app = express()

require('./db_users')
const User = require('./models/User')
console.log(User)

// metodos mongodb ->
const saveUser = async(usrnm, passwrd) => {
    let usr = new User({
        username: usrnm,
        password: passwrd
    })

    const usrSave = await usr.save()
    return usrSave
}

const getAllUsers = async() => {
    const usrs = await User.find()
    return usrs
}
// <-

// static files
app.use(express.static(path.join(__dirname, 'public')))

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended:false}))   

app.use(session({
    secret: "misrecto",
    resave: true,
    saveUninitialized: true
}))

const authoriz = (req, res, next) => {
    if(req.isAuthenticated()) return next()

    res.redirect('/login')
}

/* --- Passport --- */

app.use(passport.initialize())
app.use(passport.session())

// login
passport.use('local-login', new LocalStrategy(async(username, password, done)=> {
    console.log("asdads")
    const dataUsers = await getAllUsers()
    let user = dataUsers.find((x) => {
        return x.username === username && x.password === password
    })

    if(user) {
        done(null, user)
        return
    }

    done(null, false)

}))

// register
passport.use('local-signup', new LocalStrategy(
    {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
    }, 
    async(req, username, password, done) => {
        const dataUsers = await getAllUsers()
        let user = dataUsers.find((x) => {
            return x.username === username
        })

        if(user) {
            console.log("Ese username ya existe!")
            return done(null, false)
        } 

        let userNew = await saveUser(username, password)
        
        done(null, userNew)
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async(id, done) => {
    const dataUsers = await getAllUsers()
    let user = dataUsers.find((x) => {
        return x.id === id
    })  
    done(null, user)
})



// Routes
app.get('/all', async(req, res) => {
    const dataUsers = await getAllUsers()
    res.json({users: dataUsers})
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/home', authoriz, (req, res) => {
    res.send('Bienvenido!')
})

app.get('/faillogin', (req, res) => {
    res.render('login_signup_fail', {prompt: "LOGIN", link: "login"})
})

app.get('/failsignup', (req, res) => {
    res.render('login_signup_fail', {prompt: "SIGNUP", link: "signup"})
})

app.post('/signup', passport.authenticate("local-signup", {
    successRedirect: "/login",
    failureRedirect: "/failsignup"
})) 

app.post('/login', passport.authenticate("local-login", {
    successRedirect: "/home",
    failureRedirect: "/faillogin"
})) 

app.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

app.listen(8080, () => {
    console.log("Server running on port 8080")
})