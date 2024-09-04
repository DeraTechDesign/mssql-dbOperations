const sql = require("mssql");

class Database {
  constructor(config) {
    this.pool = new sql.ConnectionPool(config);
    this.poolConnect = this.pool.connect();

    this.pool.on("error", async (err) => {
      console.error("SQL Pool Error:", err);
      if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
        try {
          await this.reconnect();
        } catch (reconnectError) {
          console.error(
            "Failed to reconnect after pool error:",
            reconnectError
          );
        }
      }
    });
  }

  async reconnect() {
    console.log("Attempting to reconnect to database...");
    try {
      await this.pool.close();
      this.pool = new sql.ConnectionPool(this.pool.config);
      this.poolConnect = this.pool.connect();
      await this.poolConnect;
      console.log("Reconnected to database successfully.");
    } catch (error) {
      console.error("Failed to reconnect to database:", error);
      throw error;
    }
  }

  async query(sqlQuery, params = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.poolConnect;
        const request = this.pool.request();
        for (const [key, value] of Object.entries(params)) {
          request.input(key, value);
        }
        const result = await request.query(sqlQuery);
        return result;
      } catch (err) {
        console.error(`SQL Error on attempt ${attempt}:`, err);
        if (attempt < retries) {
          console.log("Retrying the query...");
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          await this.reconnect();
        } else {
          throw err;
        }
      }
    }
  }
  async isExist(tableName, columnName, value, condition = false) {
    let whereClause = condition ? `${condition}` : `${columnName} = @value`;
    const sqlQuery = `SELECT TOP 1 * FROM ${tableName} WITH (NOLOCK) WHERE ${whereClause}`;
    const params = { value };
    const result = await this.query(sqlQuery, params);
    return result.recordset.length > 0
      ? Object.values(result.recordset[0])[0]
      : false;
  }

  async getDBValues(tableName, columnName, condition = false) {
    let whereClause = condition ? `${condition}` : "1=1";
    const sqlQuery = `SELECT ${columnName} FROM ${tableName} WITH (NOLOCK) WHERE ${whereClause}`;
    const result = await this.query(sqlQuery);
    return result.recordset.length > 0 ? result.recordset : false;
  }

  async insertDBValues(tableName, values) {
    const columns = [];
    const paramRefs = [];
    const params = {};
    for (const [key, value] of Object.entries(values)) {
      columns.push(key);
      paramRefs.push(
        typeof value === "string" && value.toUpperCase() === "GETDATE()"
          ? value
          : `@${key}`
      );
      if (typeof value !== "string" || value.toUpperCase() !== "GETDATE()") {
        params[key] = value;
      }
    }
    const columnsString = columns.join(", ");
    const paramRefsString = paramRefs.join(", ");
    const sqlQuery = `INSERT INTO ${tableName} (${columnsString}) VALUES (${paramRefsString}); SELECT SCOPE_IDENTITY() AS KeyID`;
    const result = await this.query(sqlQuery, params);
    return result.recordset.length > 0
      ? Object.values(result.recordset[0])[0]
      : false;
  }

  async updateDBValues(tableName, values, condition) {
    const setClauses = [];
    const params = {};
    for (const [key, value] of Object.entries(values)) {
      setClauses.push(
        `${key} = ${
          typeof value === "string" && value.toUpperCase() === "GETDATE()"
            ? value
            : `@${key}`
        }`
      );
      if (typeof value !== "string" || value.toUpperCase() !== "GETDATE()") {
        params[key] = value;
      }
    }
    const setClause = setClauses.join(", ");
    const sqlQuery = `UPDATE ${tableName} SET ${setClause} WHERE ${condition}`;
    const result = await this.query(sqlQuery, params);
    return result.rowsAffected[0] > 0;
  }

  async truncateTable(tableName) {
    const sqlQuery = `TRUNCATE TABLE ${tableName}`;
    await this.query(sqlQuery);
  }
}

module.exports = Database;
