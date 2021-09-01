const fs = require("fs").promises;
const path = require("path");

async function main() {
    const salesDir = path.join(__dirname, "stores");
    const salesTotalsDir = path.join(__dirname, "salesTotals");

    //create the salesTotal directory if it doesn't exist
    try {
        await fs.mkdir(salesTotalsDir);
    } catch {
        console.log(`${salesTotalsDir} already exists.`);
    }

    //find paths to all the sales files
    const salesFiles = await findSalesFiles(salesDir);
    const salesTotal = await calculateSalesTotal(salesFiles);

    const report = {
        salesTotal,
        totalStores: salesFiles.length,
    };

    const reportPath = path.join(salesTotalsDir, "report.json");

    try {
        await fs.unlink(reportPath);
    } catch {
        console.log(`Failed to remove ${reportPath}`);
    }

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`Sales report written to ${salesTotalsDir}`) 
}

main();

async function findSalesFiles(folderName) {
    let salesFiles = [];

    const items = await fs.readdir(folderName, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            salesFiles = salesFiles.concat(
                await findSalesFiles(path.join(folderName, item.name))
            );
    } else {
        if (path.extname(item.name) === ".json") {
            salesFiles.push(path.join(folderName, item.name));
        }
    }
}

return salesFiles;
}

async function calculateSalesTotal(salesFiles) {
    let salesTotal = 0;
    for (file of salesFiles) {
        const data = JSON.parse(await fs.readFile(file, "utf8"));
        salesTotal += data.total;
    }
    return salesTotal;
}