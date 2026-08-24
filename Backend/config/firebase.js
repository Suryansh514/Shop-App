const admin = require("firebase-admin");
const { cert } = require("firebase-admin/app");
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: cert(serviceAccount),
});

console.log("[Firebase Admin] Connected successfully!");

module.exports = admin;