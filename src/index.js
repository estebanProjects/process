const express = require('express')

const knex = require('./db_productos_messages')

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

app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')


// Server 
const http = require('http')
const server = http.createServer(app)
const port = process.env.PORT || 8080
// Socket
const { Server, Socket } = require('socket.io');
const io = new Server(server)


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


// Routes session
app.get('/all', async(req, res) => {
    const dataUsers = await getAllUsers()
    res.json({users: dataUsers})
})

app.get('/login', (req, res) => {
    res.render('login.html')
})

app.get('/signup', (req, res) => {
    res.render('signup.html')
})

app.get('/home', authoriz, (req, res) => {
    res.send('Bienvenido!')
})

app.get('/faillogin', (req, res) => {
    res.render('login_signup_fail.html', {prompt: "LOGIN", link: "login"})
})

app.get('/failsignup', (req, res) => {
    res.render('login_signup_fail.html', {prompt: "SIGNUP", link: "signup"})
})

app.post('/signup', passport.authenticate("local-signup", {
    successRedirect: "/login",
    failureRedirect: "/failsignup"
})) 
let usuarioName = "Anónimo"
app.post('/login', passport.authenticate("local-login", {failureRedirect:'/faillogin', failureFlash: true}), 
    function(req, res) {
        console.log(req.user.username)
        usuarioName = req.user.username
        res.redirect('/')
    // successRedirect: "/",
    // failureRedirect: "/faillogin"
})

app.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

// Routes app
app.get('/', authoriz, async (req, res) => {
    let productos = await contendProd.getAll()
    let mensajes = await contendMensj.getAll()

    console.log(req.body)

    res.render('index.html', {productos, mensajes, usuarioName})
})

app.post('/', async(req, res) => {
    req.body.price = Number(req.body.price)
    await contendProd.save(req.body)

    res.redirect('/');
})

// Actualizar
app.put('/update/:id', async(req, res) => {
    await knex("products")
        .where({id: req.params.id})
        .update({title: req.body.title, price: req.body.price, thumbnail: req.body.thumbnail})
        .then((json) => {
            res.send({data:json})
        })
        .catch((err) => {
            res.send("Error al actualizar producto")
        })
})

// Delete
app.delete('/delete/:id', async (req, res) => {
    await knex("products")
        .where({id: req.params.id})
        .del()
        .then((json) => {
            res.send({data: "Producto eliminado"})
        })
        .catch((err) => {
            res.send("Error al eliminar producto")
        })
})


// consiguiente
const ContenedorProductos = require("./contenedor_productos")
const ContendedorMensajes = require("./contenedor_mensajes")

const contendProd = new ContenedorProductos()
const contendMensj = new ContendedorMensajes()

// conexion Socket
io.on("connection", (socket) => {
    console.log("Client connected")

    // Chat
    socket.on('dataMensaje', async(data) => {
        console.log(data)
        console.log("Hallo, Ich heiße Esteban")
        let mensajesAll = await contendMensj.getAll()
        mensajesAll.push(data)
        await contendMensj.save(data)
        // console.log(mensajesAll)
        io.sockets.emit('mensaje_enviado_guardado', mensajesAll)
    })

    // Productos
    socket.on("dataProducto", async(data) => {
        let productos = await contendProd.getAll()
        productos.push(data)
        await contendProd.save(data)

        io.sockets.emit('message_back', productos)
    })

})



server.listen(port, () => {
    console.log("Server running on port", port)
})