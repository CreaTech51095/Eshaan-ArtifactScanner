"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express_1 = require("express");
const cors_1 = require("cors");
const helmet_1 = require("helmet");
// Initialize Firebase Admin
admin.initializeApp();
// Import route handlers
const auth_1 = require("./auth");
const artifacts_1 = require("./artifacts");
const photos_1 = require("./photos");
const sync_1 = require("./sync");
const admin_1 = require("./admin");
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/auth', auth_1.default);
app.use('/artifacts', artifacts_1.default);
app.use('/photos', photos_1.default);
app.use('/sync', sync_1.default);
app.use('/admin', admin_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map