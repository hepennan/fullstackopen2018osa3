const mongoose = require("mongoose");
const url =
  "mongodb://myfullstack:xxxx@ds237120.mlab.com:37120/puhelinluettelo";

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
