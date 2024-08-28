"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SubjectCodeMaps_js_1 = require("./SubjectCodeMaps.js");
const readline_1 = __importDefault(require("readline"));
let totalFileSize = 0;
let numberOfFiles = 0;
let errors = [];
const bytesToSize = (bytes) => {
    if (bytes === 0)
        return '0 Byte';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
};
const fetchFileInfo = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, node_fetch_1.default)(url, { method: 'HEAD' });
        if (response.ok) {
            const contentLength = response.headers.get('Content-Length');
            return contentLength ? parseInt(contentLength, 10) : null;
        }
        if (response.status === 404) {
            errors.push(url);
        }
    }
    catch (_a) {
        errors.push(url);
    }
    return null;
});
const downloadPDF = (url_1, filepath_1, ...args_1) => __awaiter(void 0, [url_1, filepath_1, ...args_1], void 0, function* (url, filepath, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = yield (0, node_fetch_1.default)(url);
            if (!response.ok)
                throw new Error(`Status: ${response.status}`);
            const fileStream = fs_1.default.createWriteStream(filepath);
            yield new Promise((resolve, reject) => {
                response.body.pipe(fileStream);
                response.body.on('error', reject);
                fileStream.on('finish', resolve);
            });
            break;
        }
        catch (error) {
            if (attempt === retries) {
                errors.push(url);
            }
        }
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const io = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
    const askQuestion = (question) => new Promise(resolve => io.question(question, resolve));
    const main = () => __awaiter(void 0, void 0, void 0, function* () {
        const type = parseInt(yield askQuestion('Which exam are you preparing for?\n1) IGCSE 2) AS and A Levels\n'), 10);
        if (type < 1 || type > 2) {
            io.close();
            return;
        }
        const subjects = (yield askQuestion('Enter the code(s) of the subject(s) (comma separated):\n')).split(',').map(String);
        const years = (yield askQuestion('Enter the year(s) (comma separated):\n')).split(',').map(Number);
        const components = (yield askQuestion('Enter the component code(s) (comma separated):\n')).split(',').map(Number);
        const paperTypes = (yield askQuestion('Which paper type(s) are you interested in?\n 1) Question Paper 2) Marking Scheme 3) Insert (comma separated)\n')).split(',').map(Number);
        const seasons = (yield askQuestion('Paper of which season(s) are you looking for?\n1) Summer 2) Winter 3) March:\n')).split(',').map(Number);
        numberOfFiles += subjects.length * years.length * components.length * seasons.length * paperTypes.length;
        const fetchTasks = subjects.flatMap(subject => years.flatMap(year => components.flatMap(component => seasons.flatMap(season => paperTypes.map(paperType => {
            const seasonCode = season === 1 ? 's' : season === 2 ? 'w' : 'm';
            const paperTypeCode = paperType === 1 ? 'qp' : paperType === 2 ? 'ms' : 'in';
            const url = `https://papers.gceguide.cc/${type === 1 ? 'cambridge-IGCSE' : 'AS and A Levels'}/${SubjectCodeMaps_js_1.SubjectCodeMap[subject].toLowerCase()}-(${subject})/${year}/${subject}_${seasonCode}${year.toString().slice(2)}_${paperTypeCode}_${component}.pdf`;
            return fetchFileInfo(url);
        })))));
        const fileSizes = yield Promise.all(fetchTasks);
        fileSizes.forEach(size => {
            if (size)
                totalFileSize += size;
        });
        yield askQuestion('Press Enter to start the downloads...');
        const downloadTasks = subjects.flatMap(subject => years.flatMap(year => components.flatMap(component => seasons.flatMap(season => paperTypes.map(paperType => {
            const seasonCode = season === 1 ? 's' : season === 2 ? 'w' : 'm';
            const paperTypeCode = paperType === 1 ? 'qp' : paperType === 2 ? 'ms' : 'in';
            const url = `https://papers.gceguide.cc/${type === 1 ? 'cambridge-IGCSE' : 'AS and A Levels'}/${SubjectCodeMaps_js_1.SubjectCodeMap[subject].toLowerCase()}-(${subject})/${year}/${subject}_${seasonCode}${year.toString().slice(2)}_${paperTypeCode}_${component}.pdf`;
            const downloadDir = path_1.default.join(__dirname, 'Past Papers', SubjectCodeMaps_js_1.SubjectCodeMap[subject], year.toString(), component.toString());
            if (!fs_1.default.existsSync(downloadDir))
                fs_1.default.mkdirSync(downloadDir, { recursive: true });
            return downloadPDF(url, path_1.default.join(downloadDir, path_1.default.basename(url)));
        })))));
        const start = Date.now();
        yield Promise.all(downloadTasks);
        const elapsed = Date.now() - start;
        fs_1.default.writeFileSync(path_1.default.join(__dirname, "Errors", 'errors.txt'), errors.join('\n'));
        console.log(`Downloaded ${numberOfFiles - errors.length} files of size ${bytesToSize(totalFileSize)}.`);
        console.log(`Failed to download ${errors.length} files.`);
        io.close();
    });
    main();
}))();
