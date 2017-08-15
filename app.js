const express    = require("express");
const path       = require("path");
const zipdb      = require("zippity-do-dah");
const ForecastIo = require("forecastio");
const hbs        = require("express-handlebars");

const app = express();
const weather = new ForecastIo("43bb775544f6dac0688e4a96558c07fb");

app.use(express.static(path.resolve(__dirname, "public")));

app.engine("hbs", hbs({
  extname:    "hbs",
  defaultLayout:     "layout",
  layoutDir:  path.resolve(__dirname, "/views/layouts/")
}));
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get(/^\/(\d{5})$/, (req, res, next) => {
  const zipcode = req.params[0];
  const location = zipdb.zipcode(zipcode);
  if (!location.zipcode) {
    next();
    return;
  }

  const latitude = location.latitude;
  const longitude = location.longitude;

  weather.forecast(latitude, longitude, (err, data) => {
    if (err) {
      next();
      return;
    }

    res.json({
      zipcode: zipcode,
      temperature: data.currently.temperature
    });
  });
});

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(3000);
