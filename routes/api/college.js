const express = require('express');
const { check, validationResult } = require('express-validator/check');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();

const collegeInfoCSV = './database/college_costs.csv';

// decided to use column header as way to find data rather than index
const headerMap = {
  name: 'College',
  tuitionInState: 'Tuition (in-state)',
  tuitionOutOfState: 'Tuition (out-of-state)',
  roomAndBoard: 'Room & Board'
};

let colleges = [];

// read in csv right away on server startup
fs.createReadStream(collegeInfoCSV)
  .pipe(csv())
  .on('data', row => {
    college = {
      name: row[headerMap.name],
      tuitionInState: isNaN(parseFloat(row[headerMap.tuitionInState]))
        ? 0
        : parseFloat(row[headerMap.tuitionInState]),
      tuitionOutOfState: isNaN(parseFloat(row[headerMap.tuitionOutOfState]))
        ? 0
        : parseFloat(row[headerMap.tuitionOutOfState]),
      roomAndBoard: row[headerMap.roomAndBoard]
    };
    colleges.push(college);
  })
  .on('end', () => {
    console.log('CSV file successfully processed.');
  });

const checkCollegeParameters = () => {
  return [
    check('name', 'Error: College name is required')
      .not()
      .isEmpty(),
    check(
      'includeRoomAndBoard',
      'Error: includeRoomAndBoard must be true or false'
    )
      .optional({ checkFalsy: true })
      .isBoolean(),
    check('exactMatch', 'Error: exactMatch must be true or false')
      .optional({ checkFalsy: true })
      .isBoolean()
  ];
};

// @route   GET api/college
// @desc    Get info on colleges
// @access  Public
// @param   name = name of college
// @param   exactMatch = if name must match exactly
// @param   includeRoomAndBoard (default = true) = if room and board should be included in cost
router.get('/', checkCollegeParameters(), (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, exactMatch, includeRoomAndBoard } = updateParameters(
      req.query
    );

    //check pre-loaded csv file arary
    const filteredColleges = getFilteredColleges(
      name,
      exactMatch,
      includeRoomAndBoard
    );

    if (filteredColleges.length === 0) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Error: College not found' }] });
    }

    return res.status(200).json(filteredColleges);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

// updates the given query parameters for searching the data store
const updateParameters = query => {
  return {
    name: query.name.toLowerCase(),
    exactMatch: query.exactMatch ? JSON.parse(query.exactMatch) : false,
    includeRoomAndBoard: query.includeRoomAndBoard
      ? JSON.parse(query.includeRoomAndBoard)
      : true
  };
};

// returns a filtered list of colleges based on given criteria
// cost on returned objects is in dollars, but $ is left off to leave formatting up to UI
const getFilteredColleges = (name, exactMatch, includeRoomAndBoard) => {
  return colleges
    .filter(college =>
      exactMatch
        ? college.name.toLowerCase() === name
        : college.name.toLowerCase().includes(name)
    )
    .map(college => ({
      name: college.name,
      cost: includeRoomAndBoard
        ? (
            parseFloat(college.tuitionInState) +
            parseFloat(college.roomAndBoard)
          ).toFixed(2)
        : parseFloat(college.tuitionInState).toFixed(2)
    }));
};

module.exports = router;
