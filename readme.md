# mssql-dbOperations

The `mssql-dbOperations` package provides a simplified interface for performing database operations on Microsoft SQL Server databases. It encapsulates connection handling, query execution, and basic CRUD operations into a reusable and modular class.

## Features

- Connection pool management.
- Automated reconnection on connection loss.
- Simplified query execution with parameter support.
- CRUD operations including check existence, fetch, insert, update, and delete records.
- Truncate table functionality.

## Installation

Install the package using npm:

```bash
npm install mssql-dboperations
```

## Configuration

const config = {
user: 'yourUsername',
password: 'yourPassword',
server: 'yourServerAddress', // You can use 'localhost\\instance' if your SQL Server runs on the same machine but using a named instance
database: 'yourDatabaseName',
options: {
encrypt: true, // Use this if you're on Windows Azure
enableArithAbort: true
}
};

## Creating an Instance

const Database = require('mssql-dboperations');
const db = new Database(config);

## Checking if a Record Exists

async function checkExistence() {
const exists = await db.isExist("TableName", "ColumnName", "ValueToCheck");
console.log('Existence:', exists);
}
checkExistence();

## Get Database Values

async function fetchValues() {
const records = await db.getDBValues('Employees', 'Name');
console.log('Employee Names:', records);
}
fetchValues();

## Inserting Values into a Table

async function insertValues() {
const resultId = await db.insertDBValues('Employees', {
Name: 'John Doe',
Position: 'Software Engineer'
});
console.log('Inserted Record ID:', resultId);
}
insertValues();

## Update Values

async function updateValues() {
const success = await db.updateDBValues('Employees', { Position: 'Senior Engineer' }, "EmployeeId = 123");
console.log('Update Success:', success);
}
updateValues();

## Update Values

async function clearTable() {
await db.truncateTable('TemporaryData');
console.log('Table truncated successfully.');
}
clearTable();
