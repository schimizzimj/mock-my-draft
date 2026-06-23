const { writeFile } = require('fs').promises;
const path = require('path');
const { load } = require('cheerio');

const base_url = 'https://en.wikipedia.org';

/** Wait between requests. We want to be benevolent scrapers. */
const REQUEST_DELAY = 500;

/** Clean up special characters from player names
 * There may be characters like † or * that we want to remove
 * We really only need to keep letters, numbers, spaces, hypens, periods, and apostrophes
 *
 * @param {string} inputString
 */
function parseName(inputString) {
  return inputString.replace(/[^a-zA-Z0-9\s\-.'"]/, '').trim();
}

async function execute(year) {
  console.log('Grabbing data for the year:', year);
  const url = `https://en.wikipedia.org/wiki/${year}_NFL_draft`;
  const data = await fetch(url);
  const html = await data.text();
  const $ = load(html);
  const playerSelectionHeading = $('#Player_selections').parent();
  const playerSelections = playerSelectionHeading.nextUntil('h2');
  const tables = playerSelections.filter('table');

  // Find the correct table
  // One of the column headers should be 'NFL team'
  const table = tables.toArray().find((table) => {
    const headers = $(table).find('th').toArray();
    return headers.some((header) => $(header).text().includes('NFL team'));
  });

  // Extract links to team pages from the table
  const rows = $(table).find('tr').toArray();

  // Use the first row to find the index of the 'NFL team' column
  const headerRow = rows.shift();
  const headers = $(headerRow).find('th').toArray();

  const playerIndex = headers.findIndex((header) =>
    $(header).text().includes('Player'),
  );

  const prettyHeaders = {
    'nfl team': 'team',
    'rnd.': 'round',
    'pick no.': 'pick',
    player: 'player',
    'pos.': 'position',
    college: 'college',
  };

  const picks = [];
  // Wikipedia tables use th and td elements for headers and cells
  // We need to check both to find the team names

  for (const row of rows) {
    try {
      const cells = $(row).find('th, td').toArray();
      let pick = {};
      let playerDetails = {};
      cells.forEach(async (cell, index) => {
        const headerText = $(headers[index]).text().trim().toLowerCase();
        const cellText = $(cell).text().trim();

        if (index === playerIndex) {
          const playerLink = $(cell).find('a').attr('href');
          console.log(playerLink);
          if (playerLink) {
            playerDetails = await collectPlayerDetails(playerLink);
            pick.playerDetails = playerDetails;
          }
        }

        if (headerText === '' || cellText === '') return;
        if (headerText === 'notes' || headerText === 'conf.') return;
        if (headerText === 'player') {
          console.info(cellText);
        }
        pick[prettyHeaders[headerText]] =
          headerText === 'pick no.' || headerText === 'rnd.'
            ? parseInt(cellText)
            : headerText === 'player'
            ? parseName(cellText)
            : cellText;
      });
      picks.push(pick);
    } catch (error) {
      console.error(error);
    }

    // Wait between requests
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY));
  }

  // Write the data to a file
  const outputPath = path.join(__dirname, 'data', `${year}_draft_data.json`);
  await writeFile(outputPath, JSON.stringify(picks, null, 2));
}

async function collectTeamData(url) {
  // Remove everything before the last slash and replace underscores with spaces
  // Also remove the year and the word `season` from the team name
  const teamName = url
    .replace(/.*\//, '')
    .replace(/_/g, ' ')
    .replace('season', '')
    .replace(year, '')
    .trim();

  const data = await fetch(`${base_url}${url}`);
  const html = await data.text();
  const $ = load(html);

  // Grab all of the tables on the page
  const tables = $('table').toArray();

  // Find table with a `Round` column
  const table = tables.find((table) => {
    const headers = $(table).find('th').toArray();
    return headers.some((header) => $(header).text().includes('Round'));
  });

  const picks = [];
  const rows = $(table).find('tr').toArray();
  const headerRow = rows.shift();
  const headers = $(headerRow).find('th').toArray();

  /**
   * The table structure is as follows:
   * Round | Selection | Player | Position | College | Notes
   *
   * Some rows may relate to trades, so we need to skip those
   * If any cells have a `colspan` attribute, we should skip that row
   *
   * Additionally, we need to keep track of the current round
   * The round cell may have a `rowspan` attribute, so we need to keep track of that as well
   */
  let currentRound = 0;
  let roundSpan = 0;
  let skipCell = 0;
  rows.forEach((row) => {
    const cells = $(row).find('th, td').toArray();

    if (roundSpan === 0) {
      const roundCell = cells[0];
      const roundText = $(roundCell).text();
      console.info(roundText);
      const roundSpanAttr = $(roundCell).attr('rowspan');
      currentRound = parseInt(roundText);
      roundSpan = parseInt(roundSpanAttr) || 1;
    } else {
      skipCell = 1;
    }

    if (cells.some((cell) => $(cell).attr('colspan'))) {
      roundSpan--;
      return;
    }

    console.log('Cells:', cells.length);
    console.log('Headers:', headers.length);
    console.log(headers.map((header) => $(header).text().trim()));
    console.log(
      skipCell
        ? [currentRound, ...cells.map((cell) => $(cell).text().trim())]
        : cells.map((cell) => $(cell).text().trim()),
    );
    console.log('-'.repeat(50));

    const pick = {};
    headers.forEach((header, index) => {
      const adjustedCells = skipCell
        ? [currentRound, ...cells.map((cell) => $(cell).text().trim())]
        : cells.map((cell) => $(cell).text().trim());
      const key = $(header).text().trim().toLowerCase();
      if (key === 'notes') return;
      const value = adjustedCells[index];
      pick[key] =
        key === 'selection' || key === 'round' ? parseInt(value) : value;
    });
    picks.push(pick);
    roundSpan--;
    skipCell = 0;
  });

  console.info(teamName);
  picks.forEach((pick) => {
    console.info(pick);
  });
  console.info('\n\n\n');
}

async function collectPlayerDetails(url) {
  const data = await fetch(`${base_url}${url}`);
  const html = await data.text();
  const $ = load(html);

  // Get rid of all <style> tags
  $('style').remove();

  let playerDetails = {};

  // In the infobox we only care about 'Born', 'Height', and 'Weight'
  const columnsOfInterest = ['born', 'height', 'weight'];
  const infobox = $('.infobox').toArray();
  const rows = $(infobox).find('tr').toArray();
  rows.forEach((row) => {
    const cells = $(row).find('th, td').toArray();
    const key = $(cells[0]).text().trim().toLowerCase().replace(':', '');
    if (!columnsOfInterest.includes(key)) return;
    if (key === 'born') {
      const dob = $(cells[1]).find('span.bday').text().trim();

      // The hometown is everything after the <br />
      const hometown = $(cells[1]).find('br').next().text().trim();

      playerDetails[key.split(':')[0]] = dob;
      playerDetails['hometown'] = hometown;

      return;
    }
    if (key === 'height') {
      const height = $(cells[1]).text().trim();

      // The height is in the format `ft in (m)`
      // We only care about the `ft in` part
      // And we'll store it as total inches
      const [feet, inches] = height.split(' ');
      const totalInches = parseInt(feet) * 12 + parseInt(inches);
      playerDetails[key] = totalInches;
      return;
    }
    if (key === 'weight') {
      const weight = $(cells[1]).text().trim();

      // We just want the number of lbs
      // It's in the format `xxx lb (yy kg)`
      const [lbs] = weight.split(' ');
      playerDetails[key] = parseInt(lbs);
      return;
    }
  });

  // Now we want to grab the player's pre-draft measurables
  // It should be in a table with a caption that includes 'Pre-draft measurables'
  const preDraftMeasurablesTable = $('caption')
    .toArray()
    .find((caption) => {
      return $(caption).text().toLowerCase().includes('pre-draft measurables');
    });

  const headersMap = {
    'arm length': 'armLength',
    'hand span': 'handSize',
    '40-yard dash': 'fortyYardDash',
    '20-yard shuttle': 'twentyYardShuttle',
    '10-yard split': 'tenYardSplit',
    '20-yard split': 'twentyYardSplit',
    'bench press': 'benchPress',
    'vertical jump': 'verticalJump',
    'broad jump': 'broadJump',
    'three-cone drill': 'threeConeDrill',
  };

  const draftRows = $(preDraftMeasurablesTable).next().find('tr').toArray();
  const headers = $(draftRows.shift()).find('th').toArray();
  const measurables = {};
  // There only row we care about is the first after the header
  const measurableRow = draftRows.shift();
  const cells = $(measurableRow).find('td').toArray();
  cells.forEach((cell, index) => {
    let key = $(headers[index]).text().trim().toLowerCase();
    key = key in headersMap ? headersMap[key] : key;
    // There may be a `<style>` tag in the cell
    // We need to remove it before parsing the value
    const value = $(cell).text().trim();
    if (value.includes('ft')) {
      measurables[key] = parseHeight(value);
    } else if (value.includes('in')) {
      measurables[key] = parseIn(value);
    } else if (value.includes('lb')) {
      measurables[key] = parseWeight(value);
    } else if (value.includes('s')) {
      measurables[key] = parseTime(value);
    } else {
      measurables[key] = parseUnicodeFraction(value) ?? value;
    }
  });

  playerDetails = { ...measurables, ...playerDetails };

  return playerDetails;
}

/**
 * Parse a value containing a Unicode fraction slash (U+2044) like "303⁄8" or "32+1⁄4".
 * Returns a decimal number, or null if the value doesn't contain a Unicode fraction.
 */
function parseUnicodeFraction(value) {
  const FRACTION_SLASH = '\u2044';
  if (!value.includes(FRACTION_SLASH)) return null;

  const [left, denomStr] = value.split(FRACTION_SLASH);
  const denom = parseInt(denomStr);
  if (isNaN(denom)) return null;

  if (left.includes('+')) {
    const [wholeStr, numerStr] = left.split('+');
    return parseInt(wholeStr) + parseInt(numerStr) / denom;
  }

  // Concatenated form e.g. "303⁄8" → whole=30, numer=3
  const numer = parseInt(left.slice(-1));
  const whole = left.length > 1 ? parseInt(left.slice(0, -1)) : 0;
  return whole + numer / denom;
}

/**
 * Parse fields in the format `ft in (m)` and return the total inches
 * @param {string} height
 */
function parseHeight(height) {
  const [feet, inches] = height.split(' ');
  return parseInt(feet) * 12 + parseInt(inches);
}

/**
 * Parse fields in the format `whole+frac in(m)` and return the total inches
 * We grab the meters and convert since it's more accurate
 * @param {string} height
 */
function parseIn(inputString) {
  const METER_TO_INCH = 39.37008;
  let meters = inputString.split('(');
  if (meters.length < 2) {
    return parseInt(inputString);
  }
  meters = meters[1].split('m')[0];
  const convertedMeters = parseFloat(meters) * METER_TO_INCH;
  // Round to the nearest 1/8th of an inch, since this is what they do at the combine
  return Math.round(convertedMeters * 8) / 8;
}

/**
 * Parse fields in the format `number s` and return the number
 * @param {string} time
 */
function parseTime(time) {
  return parseFloat(time.split(' ')[0]);
}

/**
 * Parse fields in the format `xxx lb (yy kg)` and return the number of lbs
 * @param {string} weight
 */
function parseWeight(weight) {
  return parseInt(weight.split(' ')[0]);
}

const collectDataForSpan = async (startYear, endYear) => {
  for (let year = startYear; year <= endYear; year++) {
    await execute(year);
  }
};

const startYear = parseInt(process.argv[2], 10) || 2025;
const endYear = parseInt(process.argv[3], 10) || startYear;
collectDataForSpan(startYear, endYear);
