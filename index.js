console.log("starting server");

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Martti Tienari",
    number: "040-123456",
    id: 2
  },
  {
    name: "Arto Järvinen",
    number: "040-123456",
    id: 3
  },
  {
    name: "Lea Kutvonen",
    number: "040-123456",
    id: 4
  }
];

const express = require("express");
const app = express();
const cors = require("cors");

const bodyParser = require("body-parser");

var morgan = require("morgan");
//app.use(morgan('tiny'))

morgan.token("reqData", (req, res) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :reqData :status :res[content-length] - :response-time ms"
  )
);
app.use(bodyParser.json());
app.use(cors());

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  res.send(
    "puhelinluettelossa on "
      .concat(persons.length)
      .concat(" henkilön tiedot<br />")
      .concat(new Date().toUTCString())
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  console.log(persons);
  persons = persons.filter(person => person.id !== id);
  console.log("deleted person with id ".concat(id));
  console.log(persons);
  response.status(204).end();
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const generateId = () => {
  const id = getRandomInt(1000000);
  return id;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (body.name === undefined || body.name === "") {
    return response.status(400).json({ error: "name missing" });
  }
  if (body.number === undefined || body.number === "") {
    return response.status(400).json({ error: "number missing" });
  }
  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ error: "name must be unique" });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  };

  persons = persons.concat(person);

  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 */
