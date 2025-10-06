"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveQuestionnaire = saveQuestionnaire;
exports.getQuestionnaire = getQuestionnaire;
exports.listQuestionnaires = listQuestionnaires;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DATA_DIR = path_1.default.resolve(process.cwd(), 'data');
const STORE_FILE = path_1.default.join(DATA_DIR, 'questionnaires.json');
function ensureDataDir() {
    if (!fs_1.default.existsSync(DATA_DIR))
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs_1.default.existsSync(STORE_FILE))
        fs_1.default.writeFileSync(STORE_FILE, JSON.stringify({}), 'utf8');
}
ensureDataDir();
function readStore() {
    try {
        const raw = fs_1.default.readFileSync(STORE_FILE, 'utf8');
        return JSON.parse(raw || '{}');
    }
    catch (err) {
        return {};
    }
}
function writeStore(store) {
    fs_1.default.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}
function saveQuestionnaire(q) {
    // Always persist to JSON store. Prisma-backed persistence is handled by app.ts when available.
    const store = readStore();
    store[q.id] = q;
    writeStore(store);
    try {
        const keys = Object.keys(readStore());
        console.error('JSON store saved id:', q.id, 'current ids:', keys);
    }
    catch (e) {
        console.error('Failed to read store for debug', e);
    }
}
function getQuestionnaire(id) {
    const store = readStore();
    return store[id] || null;
}
function listQuestionnaires() {
    const store = readStore();
    return Object.values(store);
}
exports.default = {
    saveQuestionnaire,
    getQuestionnaire,
    listQuestionnaires
};
