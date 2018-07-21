const mongoose = require("mongoose");
if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config()
}


const url = process.env.MONGODB_URI;

mongoose.connect(
  url,
  { useNewUrlParser: true }
);

const Person = mongoose.model("Person", {
  name: String,
  number: String
});

if (process.argv.length === 4) {
  const name = process.argv[2];
  const number = process.argv[3];

  const person = new Person({
    name: name,
    number: number
  });

  person.save().then(response => {
    console.log(
      "lisätään henkilö",
      response.name,
      "numero",
      response.number,
      "luetteloon"
    );
    mongoose.connection.close();
  });
} else {
  console.log("puhelinluettelo:");
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, " ", person.number);
    });
    mongoose.connection.close();
  });
}
