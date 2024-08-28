 import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { SubjectCodeMap } from './SubjectCodeMaps.js';
import readline from 'readline';

let totalFileSize = 0;
let numberOfFiles = 0;
let errors: string[] = [];

const bytesToSize = (bytes: number): string => {
    if (bytes === 0) return '0 Byte';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
};

const fetchFileInfo = async (url: string): Promise<number | null> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            const contentLength = response.headers.get('Content-Length');
            return contentLength ? parseInt(contentLength, 10) : null;
        }
        if (response.status === 404) {
            errors.push(url);
        }
    } catch {
        errors.push(url);
    }
    return null;
};

const downloadPDF = async (url: string, filepath: string, retries = 3): Promise<void> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const fileStream = fs.createWriteStream(filepath);
            await new Promise((resolve, reject) => {
                response.body.pipe(fileStream);
                response.body.on('error', reject);
                fileStream.on('finish', resolve);
            });
            break;
        } catch (error) {
            if (attempt === retries) {
                errors.push(url);
            }
        }
    }
};

(async () => {
    const io = readline.createInterface({ input: process.stdin, output: process.stdout });
    const askQuestion = (question: string): Promise<string> => new Promise(resolve => io.question(question, resolve));

    const main = async () => {
        const type = parseInt(await askQuestion('Which exam are you preparing for?\n1) IGCSE 2) AS and A Levels\n'), 10);
        if (type < 1 || type > 2) {
            io.close();
            return;
        }

        const subjects = (await askQuestion('Enter the code(s) of the subject(s) (comma separated):\n')).split(',').map(String);
        const years = (await askQuestion('Enter the year(s) (comma separated):\n')).split(',').map(Number);
        const components = (await askQuestion('Enter the component code(s) (comma separated):\n')).split(',').map(Number);
        const paperTypes = (await askQuestion('Which paper type(s) are you interested in?\n 1) Question Paper 2) Marking Scheme 3) Insert (comma separated)\n')).split(',').map(Number);
        const seasons = (await askQuestion('Paper of which season(s) are you looking for?\n1) Summer 2) Winter 3) March:\n')).split(',').map(Number);

        numberOfFiles += subjects.length * years.length * components.length * seasons.length * paperTypes.length;

        const fetchTasks = subjects.flatMap(subject =>
            years.flatMap(year =>
                components.flatMap(component =>
                    seasons.flatMap(season =>
                        paperTypes.map(paperType => {
                            const seasonCode = season === 1 ? 's' : season === 2 ? 'w' : 'm';
                            const paperTypeCode = paperType === 1 ? 'qp' : paperType === 2 ? 'ms' : 'in';
                            const url = `https://papers.gceguide.cc/${type === 1 ? 'cambridge-IGCSE' : 'AS and A Levels'}/${SubjectCodeMap[subject].toLowerCase()}-(${subject})/${year}/${subject}_${seasonCode}${year.toString().slice(2)}_${paperTypeCode}_${component}.pdf`;
                            return fetchFileInfo(url);
                        })
                    )
                )
            )
        );

        const fileSizes = await Promise.all(fetchTasks);
        fileSizes.forEach(size => {
            if (size) totalFileSize += size;
        });

        await askQuestion('Press Enter to start the downloads...');

        const downloadTasks = subjects.flatMap(subject =>
            years.flatMap(year =>
                components.flatMap(component =>
                    seasons.flatMap(season =>
                        paperTypes.map(paperType => {
                            const seasonCode = season === 1 ? 's' : season === 2 ? 'w' : 'm';
                            const paperTypeCode = paperType === 1 ? 'qp' : paperType === 2 ? 'ms' : 'in';
                            const url = `https://papers.gceguide.cc/${type === 1 ? 'cambridge-IGCSE' : 'AS and A Levels'}/${SubjectCodeMap[subject].toLowerCase()}-(${subject})/${year}/${subject}_${seasonCode}${year.toString().slice(2)}_${paperTypeCode}_${component}.pdf`;
                            const downloadDir = path.join(__dirname, 'Past Papers', SubjectCodeMap[subject], year.toString(), component.toString());
                            if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
                            return downloadPDF(url, path.join(downloadDir, path.basename(url)));
                        })
                    )
                )
            )
        );

        const start = Date.now();
        await Promise.all(downloadTasks);
        const elapsed = Date.now() - start;

        fs.writeFileSync(path.join(__dirname,"Errors", 'errors.txt'), errors.join('\n'));

        console.log(`Downloaded ${numberOfFiles - errors.length} files of size ${bytesToSize(totalFileSize)}.`);
        console.log(`Failed to download ${errors.length} files.`);
        io.close();
    };

    main();
})();
