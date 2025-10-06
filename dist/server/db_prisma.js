"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveQuestionnairePrisma = saveQuestionnairePrisma;
exports.getQuestionnairePrisma = getQuestionnairePrisma;
exports.listQuestionnairesPrisma = listQuestionnairesPrisma;
const prismaClient_1 = __importDefault(require("./prismaClient"));
const DEBUG = process.env.DEBUG === 'true' || process.env.DEBUG === '1';
function debugLog(...args) {
    if (DEBUG) {
        // Use console.debug so it's lower-noise than console.error
        console.debug('[debug] ', ...args);
    }
}
async function saveQuestionnairePrisma(q) {
    await prismaClient_1.default.questionnaire.upsert({
        where: { id: q.id },
        update: { json: JSON.stringify(q) },
        create: { id: q.id, json: JSON.stringify(q) }
    });
}
async function getQuestionnairePrisma(id) {
    const row = await prismaClient_1.default.questionnaire.findUnique({ where: { id } });
    if (!row)
        return null;
    return JSON.parse(row.json);
}
async function listQuestionnairesPrisma() {
    const rows = await prismaClient_1.default.questionnaire.findMany();
    return rows.map((r) => {
        // Prisma may return the `json` column as a string or already-parsed value
        const raw = r.json;
        if (typeof raw === 'string') {
            try {
                return JSON.parse(raw);
            }
            catch (err) {
                debugLog('db_prisma: failed to parse questionnaire json', err, raw);
                // Fallback: attempt coercion
                return JSON.parse(String(raw));
            }
        }
        return raw;
    });
}
