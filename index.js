const morgan = require('morgan');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

morgan.token('postlog', (request) => {
  if (request.method === 'POST') return JSON.stringify(request.body);
  return '';
});

app.use(express.static('build'));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postlog'));

app.use(cors());

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  }).catch((err) => next(err));
});

app.get('/info', (request, response, next) => {
  Person.countDocuments({}).then((count) => {
    response.send(`<div>Phonebook has info for ${count} people <br/>
        ${new Date()}</div>`);
  }).catch((err) => next(err));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then((person) => {
    if (person)response.json(person);
    else response.status(404).end();
  }).catch((err) => next(err));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then((delPerson) => {
    if (delPerson) {
      response.status(204).json(delPerson);
    } else response.status(404).end();
  }).catch((err) => next(err));
});

app.post('/api/persons', (request, response, next) => {
  const { body } = request;
  if (!body.name) {
    response.status(400).json({
      error: 'A person needs a name',
    });
  }
  Person.findOne({ name: { $regex: new RegExp(`^${body.name}$`, 'i') } }).then((person) => {
    if (person) {
      return response.status(400).json({
        error: `An entry with name ${body.name} already exists id: ${person._id}`,
        id: person._id.toString(),
      });
    }
    if (!body.number) {
      response.status(400).json({
        error: 'A new person needs a name and a number',
      });
    }
    const newPerson = new Person({
      name: body.name,
      name_lower: body.name.toLowerCase(),
      number: body.number,
    });
    return newPerson.save();
  }).then((savedPerson) => {
    if (savedPerson) response.json(savedPerson);
  }).catch((err) => next(err));
});

app.put('/api/persons/:id', (request, response, next) => {
  let { name, number } = request.body;
  if (!name && !number) {
    return response.status(400).json({ error: 'Need a new name or number.' });
  }
  if (!name)name = undefined;
  if (!number)number = undefined;
  return Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' }).then((updatedPerson) => response.json(updatedPerson)).catch((err) => next(err));
});

const unknownEndPoint = (request, response) => {
  response.status(404).json({ error: 'Unknown endpoint' });
};

app.use(unknownEndPoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') return response.status(400).json({ error: 'Malformatted id' });
  if (error.name === 'ValidationError') return response.status(400).json({ error: error.message });
  return next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
