const socket = io()

const table = document.getElementById('table')
const tbody = document.getElementById('tbody')
const btn = document.getElementById('input_button')

const spanUsername = document.getElementById('spanUsername')

document.querySelector('#input_correo').disabled = true

const addProduct = () => {
    let dataObj = {
        title: document.querySelector('#title').value,
        price: document.querySelector('#price').value,
        thumbnail: document.querySelector('#thumbnail').value
    }
    console.log(dataObj)
    socket.emit('dataProducto', dataObj)
}

const render = (data) => {
    console.log(data)
    let html = data.map(x => {
        return `
        <tr>
            <td> ${x.title} </td>
            <td> ${x.price} </td>
            <td> <img src="${x.thumbnail}" /> </td>
        </tr>
    `}).join(" ")
    tbody.innerHTML = html
}

btn.addEventListener('click', (e) => {
    e.preventDefault()
    addProduct()
})

socket.on('message_back', (data) => {
    console.log(data)
    render(data)
    socket.emit("message_client", "Hello, I am the Frontend")
})


// Chat
socket.on('mensaje_enviado_guardado', (data) => {
    renderChat(data)
})

const renderChat = (data) => {
    let html = data.map(x => {
        return `
        <p> <strong class="correo">${x.name}</strong><b class="hora">[${x.shippingDate}]</b><i class="mensaje">: ${x.message}</i></p>
        `
    }).join(" ")

    document.querySelector('#box_mensajes').innerHTML = html
}

const addInfoMns = () => {
    console.log("Mensaje :D")
    let fechaActual = new Date()
    let fechaDeEnvio = `${fechaActual.toLocaleDateString()} ${fechaActual.getHours()}:${fechaActual.getMinutes()}:${fechaActual.getSeconds()}`
    let dataMensaje = {
        name: document.querySelector('#input_correo').value,
        message: document.querySelector('#input_mensaje').value,
        shippingDate: fechaDeEnvio
    }
    document.querySelector("#input_mensaje").value = ''
    console.log(dataMensaje)
    socket.emit('dataMensaje', dataMensaje)
}


const btn_mns = document.getElementById('btn_mensaje')

btn_mns.addEventListener('click', (e) => {
    e.preventDefault()
    addInfoMns()
})