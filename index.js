console.log("starting server");

const express = require("express");
const app = express();
const cors = require("cors");
const Person = require("./models/person");
const bodyParser = require("body-parser");

var morgan = require("morgan");
//app.use(morgan('tiny'))
app.use(express.static("build"));
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

const formatPerson = person => {
  return {
    name: person.name,
    number: person.number,
    id: person._id
  };
};

app.get("/api/persons", (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons.map(formatPerson));
    })
    .catch(error => {
      console.log(error);
      response.status(500).end();
    });
});

app.get("/info", (request, response) => {
  Person.countDocuments({}, function(err, count) {
    if (err) console.log(err);
    else {
      response.send(
        "<!DOCTYPE html><html><body>puhelinluettelossa on "
          .concat(count)
          .concat(" henkilön tiedot<br />")
          .concat(new Date().toUTCString())
          .concat("</body></html>")
      );
    }
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(formatPerson(person));
    })
    .catch(error => {
      console.log("Error: Person with id ", request.params.id, "not found");
      response
        .status(404)
        .send({ error: "person with the requested id does not exist" })
        .end();
    });
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        Person.deleteOne(person)
          .then(() => {
            response.status(204).end();
          })
          .catch(error => {
            console.log(error);
            return response
              .status(500)
              .json({ error: "error trying to delete person" });
          });
      } else {
        console.log("ERROR: person requested to be deleted does not exist");
        return response
          .status(400)
          .json({ error: "could not find person to be deleted" });
      }
    })
    .catch(error => {
      console.log(
        "ERROR: Trying to delete person with id",
        request.params.id,
        "!"
      );
      console.log(error);
      return response
        .status(500)
        .json({ error: "error when trying to delete person" });
    });
});

function handleError(err) {
  console.log("My Error!");
  console.log(err);
}

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (body.name === undefined || body.name === "") {
    console.log("ERROR: name is missing");
    return response.status(400).json({ error: "name missing" });
  }
  if (body.number === undefined || body.number === "") {
    console.log("ERROR: number is missing");
    return response.status(400).json({ error: "number missing" });
  }

  console.log("AFTER THAT")
  const newPerson = new Person({
    name: body.name,
    number: body.number
  });
  var query = Person.where({ name: body.name });
  query
    .findOne(function(err, person) {
      if (err) {
        return handleError(err);
      }
      if (person) {
        console.log("Person with name", body.name, "already exists");
        return response.status(400).json({ error: "name must be unique" });
      } else {
        console.log(
          "Person with name",
          body.name,
          "does not exist and will be added"
        );
        newPerson
          .save()
          .then(savedPerson => {
            response.json(formatPerson(savedPerson));
          })
          .catch(error => {
            console.log("error saving new person");
            console.log(error);
          });
      }
    })
    .catch(error => {
      console.log(error);
    });
});

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  const newPerson = {
    name: body.name,
    number: body.number
  };
  Person.findByIdAndUpdate(request.params.id, newPerson, { upsert: true })
    .then(response.status(204).end())
    .catch(error => {
      console.log(error);
      response
        .status(400)
        .send({ error: "malformatted id" })
        .end();
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
