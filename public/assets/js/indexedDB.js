const { response } = require("express");

let db;
const request = window.indexedDB.open("budget-tracker, 1");

function checkForIndexedDb() {
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
    return false;
  }
  return true;
}

request.onupgradeneeded = ({ target }) => {
  db = target.result;
  const pendingStore = db.createdObjectStore("PendingStore", {
    autoIncrement: true,
  });
};

request.onsuccess = function (e) {
  db = request.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log("There was an error");
};

function saveRecord(record) {
  const transaction = db.transaction(["PendingStore"], "readwrite");
  const store = transaction.objectStore("PendingStore");

  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["PendingStore"], "readwrite");
  const store = transaction.objectStore("PendingStore");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          if (response.length !== 0) {
            transaction = db.transaction(["PendingStore"], "readwrite");
            const currentStore = transaction.objectStore("PendingStore");
            currentStore.clear();
          }
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
