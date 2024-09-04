const Database = require("./DBOperations");

const config = {
  user: "user",
  password: "pass",
  server: "DESKTOP1-RUTK0G",
  database: "EXAMPLE_DATABASE",
  port: 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 15000,
  },
  connectionTimeout: 15000,
  requestTimeout: 15000,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const configSayacDB = {
  user: "sayac_user",
  password: "pass",
  server: "DESKTOP1-RUTK0G",
  database: "SAYAC",
  port: 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 15000,
  },
  connectionTimeout: 15000,
  requestTimeout: 15000,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const db = new Database(config);
const dbSayac = new Database(configSayacDB);

async function test() {
  const isExist = await db.isExist("ISMERKEZI", "IsMerkeziKodu", "C01");
  const isExistSayac = await dbSayac.isExist("SAYAC2", "SayacAdet", 40);

  const getDBValues = await db.getDBValues(
    "ISMERKEZI",
    "MasterID, IsMerkeziAdi",
    "IsMerkeziKodu='C01'"
  );

  // const insertDBValues = await db.insertDBValues("ISMERKEZI", {
  //   MasterID: 1,
  //   IsMerkeziKodu: "deneme",
  //   IsMerkeziKodu: "deneme",
  //   IsMerkeziAdi: "deneme",
  // });

  // const updateDBValues = await db.updateDBValues(
  //   "ISMERKEZI",
  //   { IsMerkeziAdi: "deneme" },
  //   "IsMerkeziKodu='C01'"
  // );

  console.log("isExist:", isExist);
  console.log("isExistSayac:", isExistSayac);
  console.log("getDBValues:", getDBValues);
  // console.log("insertDBValues:", insertDBValues);
  // console.log("updateDBValues", updateDBValues);
}

test();
