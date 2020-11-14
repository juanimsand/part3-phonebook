const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()


app.use(express.json())
app.use(cors())

/*
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(requestLogger)
*/

morgan.token('data', (request, response) => {
    const body = request.body
    return JSON.stringify(body)
});


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

const IDRANGE = 100000

let phonebook = [
    {
        id:1,
        name: "Juan Imsand",
        number: "123-4567"
    },
    {
        id: 2,
        name: "Maria Fontana",
        number:"456-1987"
    },
    {
        id: 3,
        name: "Marcos Perez",
        number:"522-1473"
    }
]

const generateId = () => {
    const id = Math.floor(Math.random() * IDRANGE)
    return id
}

app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get('/info', (request, response) => {
    const starting = "Phone book has info for "
    const phonebookqty = phonebook.length.toString()
    const datenow = new Date().toString()
    const cadena = starting.concat(phonebookqty, " people", "\n", datenow)
    response.end(cadena)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = phonebook.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(phonebook => phonebook.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    const nameExists = phonebook.find(person => person.name === body.name)

    if (!body.name) {
        return response.status(400).json({
            error: 'error name missing'
        })
    }
    else if (!body.number) {
        return response.status(400).json({
            error: 'error number missing'
        })
    }
    else if (nameExists) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    phonebook = phonebook.concat(person)
    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})