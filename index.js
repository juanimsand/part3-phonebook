require('dotenv').config()
const express = require('express')
const app = express()

const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/persons')



app.use(express.json())
app.use(express.static('build'))
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

/*
const url =
    `mongodb+srv://fullstack:passwordhere@cluster0.lv8sg.mongodb.net/<dbname>?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})


const Person = mongoose.model('Person', personSchema)

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
*/
/*
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
}*/

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const starting = "Phone book has info for "
    Person.countDocuments({}, (error, count) => {
        const datenow = new Date().toString()
        const cadena = starting.concat(count, " people", "\n", datenow)
        response.end(cadena)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(
        person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => { next(error)})
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if ((body.name === undefined) || (body.number === undefined)) {
        return response.status(400).json({ error: 'name or number missing' })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person
        .save()
        .then(savedPerson => savedPerson.toJSON())
        .then(savedAndFormattedPerson => { response.json(savedAndFormattedPerson) })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { runValidators: true, new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})