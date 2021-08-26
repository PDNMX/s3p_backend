import fs from "fs";
const JSZip = require("jszip");

const addFilesFromDirectoryToZip = (directoryPath = "", zip) => {
    const directoryContents = fs.readdirSync(directoryPath, {
        withFileTypes: true,
    });

    directoryContents.forEach(({ name }) => {
        const path = `${directoryPath}/${name}`;

        if (fs.statSync(path).isFile()) {
            zip.file(path, fs.readFileSync(path, "utf-8"));
        }

        if (fs.statSync(path).isDirectory()) {
            addFilesFromDirectoryToZip(path, zip);
        }
    });
};

export default async (directoryPath = "") => {
    const zip = new JSZip();
    addFilesFromDirectoryToZip(directoryPath, zip);
    const zipAsBase64 = await zip.generateAsync({ type: "base64" });
    fs.rmdirSync(directoryPath,{recursive:true})
    return zipAsBase64;
};

