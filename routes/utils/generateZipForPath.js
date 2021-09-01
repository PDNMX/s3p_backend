import fs from "fs";
const JSZip = require("jszip");


const addFilesFromDirectoryToZip = (directoryPath = "", zip) => {
    const directoryContents = fs.readdirSync(directoryPath, {
        withFileTypes: true,
    });

    directoryContents.forEach(({ name }) => {
        const path = `${directoryPath}/${name}`;

        if (fs.statSync(path).isFile()) {
            zip.file(`_${path}`, fs.readFileSync(path, "utf-8"));
        }

        if (fs.statSync(path).isDirectory()) {
            addFilesFromDirectoryToZip(path, zip);
        }
    });
};

export default async (directoryPath = "") => {
    const zip = new JSZip();
    addFilesFromDirectoryToZip(directoryPath, zip);

    await zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream(directoryPath+'.zip'))
        .on('finish', function () {
            // JSZip generates a readable stream with a "end" event,
            // but is piped here in a writable stream which emits a "finish" event.
            console.log(`${directoryPath}.zip written`);
            return directoryPath;
        });
};

