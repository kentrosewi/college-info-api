const express = require('express');

const app = express();

// define routes
app.use('/api/college', require('./routes/api/college'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}.`));
