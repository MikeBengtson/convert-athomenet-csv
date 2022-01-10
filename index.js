const fs = require('fs');
const path = require('path');
const { parse, format } = require('fast-csv');
const { stringify } = require('querystring');

let rows = [];
let newResidents = 0;

if (process.argc != 1) {
  console.log("Usage: node index.js {at-home-network-address-export.csv}")
  console.log("Creates {at-home-network-address-export.csv}.out with normalized member records.")
}

const args = process.argv.slice(2);

function eraseFields(obj1, obj2, index)  {
  obj1[index] = "";
  obj2[index] = "";
}

fs.createReadStream(path.resolve(__dirname, args[0]))
  .pipe(parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
      if (row["Resident 2 Email"] != undefined && row["Resident 2 Email"].length >0) {
          let newRow = {...row};
          newRow["Email"] = newRow["Resident 2 Email"];
          eraseFields(newRow, row, "Resident 2 Email");

          newRow["Last Name"] = newRow["Resident 2 Last Name"] ? newRow["Resident 2 Last Name"] : newRow["Last Name"];
          eraseFields(newRow, row, "Resident 2 Last Name");
          
          newRow["First Name"] = newRow["Resident 2 First Name"];
          eraseFields(newRow, row, "Resident 2 First Name");
          
          newRow["Work Phone"] = newRow["Resident 2 Work Phone"];
          eraseFields(newRow, row, "Resident 2 Work Phone");
          
          newRow["Cell Phone"] = newRow["Resident 2 Cell Phone"];
          eraseFields(newRow, row, "Resident 2 Cell Phone");
          
          rows.push(newRow);
          console.log(`Added: ${newRow["Email"]} - ${newRow["Last Name"]}, ${newRow["First Name"]}`);
          newResidents++;
      }
      rows.push(row);
  })
  .on('end', rowCount => {
      console.log(`Parsed ${rowCount} rows and added ${newResidents} new residents`);
      const csvFile = fs.createWriteStream(args[0]+".out");

    const stream = format({ headers:true });
    stream.pipe(csvFile);
    rows.forEach((row)=>    stream.write(row));
    stream.end();
  });




