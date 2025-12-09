import fs from 'fs';
import csv from 'csv-parser';
// import { PrismaClient } from '../../generated/prisma';
import { prisma } from '../lib/prisma.js';

// const prisma = new PrismaClient();

interface CSVRow {
    'Customer ID': string;
    'Customer Name': string;
    'Phone Number': string;
    'Gender': string;
    'Age': string;
    'Customer Region': string;
    'Customer Type': string;
    'Product ID': string;
    'Product Name': string;
    'Brand': string;
    'Product Category': string;
    'Tags': string;
    'Quantity': string;
    'Price per Unit': string;
    'Discount Percentage': string;
    'Total Amount': string;
    'Final Amount': string;
    'Date': string;
    'Payment Method': string;
    'Order Status': string;
    'Delivery Type': string;
    'Store ID': string;
    'Store Location': string;
    'Salesperson ID': string;
    'Employee Name': string;
}

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed for large dataset...');
        console.log('⏱️  This may take several minutes...');

        console.log('🗑️  Clearing existing data...');
        const deleteResult = await prisma.sales.deleteMany({});
        console.log(`✅ Cleared ${deleteResult.count} existing records`);

        let transactions: any[] = [];
        let totalInserted = 0;
        let totalParsed = 0;
        const batchSize = 500;
        const startTime = Date.now();

        const stream = fs.createReadStream('scripts/truestate_assignment_dataset.csv')
            .pipe(csv())
            .on('data', async (row: CSVRow) => {
                try {
                    totalParsed++;

                    let tags: string[] = [];
                    if (row['Tags']) {
                        tags = row['Tags']
                            .split(/[,;|]/)
                            .map(tag => tag.trim())
                            .filter(tag => tag.length > 0);
                    }

                    let date: Date;
                    try {
                        date = new Date(row['Date']);
                        if (isNaN(date.getTime())) {
                            date = new Date();
                        }
                    } catch (e) {
                        date = new Date();
                    }

                    transactions.push({
                        customerId: row['Customer ID'] || '',
                        customerName: row['Customer Name'] || '',
                        phoneNumber: row['Phone Number'] || '',
                        gender: row['Gender'] || '',
                        age: parseInt(row['Age']) || 0,
                        customerRegion: row['Customer Region'] || '',
                        customerType: row['Customer Type'] || '',

                        productId: row['Product ID'] || '',
                        productName: row['Product Name'] || '',
                        brand: row['Brand'] || '',
                        productCategory: row['Product Category'] || '',
                        tags: tags,

                        quantity: parseInt(row['Quantity']) || 0,
                        pricePerUnit: parseFloat(row['Price per Unit']) || 0,
                        discountPercentage: parseFloat(row['Discount Percentage']) || 0,
                        totalAmount: parseFloat(row['Total Amount']) || 0,
                        finalAmount: parseFloat(row['Final Amount']) || 0,

                        date: date,
                        paymentMethod: row['Payment Method'] || '',
                        orderStatus: row['Order Status'] || '',
                        deliveryType: row['Delivery Type'] || '',
                        storeId: row['Store ID'] || '',
                        storeLocation: row['Store Location'] || '',
                        salespersonId: row['Salesperson ID'] || '',
                        employeeName: row['Employee Name'] || '',
                    });

                    if (transactions.length >= batchSize) {
                        stream.pause();

                        try {
                            await prisma.sales.createMany({
                                data: transactions,
                            });
                            totalInserted += transactions.length;

                            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                            const rate = Math.round(totalInserted / (Date.now() - startTime) * 1000);
                            const progress = ((totalInserted / 1000000) * 100).toFixed(1);

                            console.log(`✅ Progress: ${progress}% | Inserted: ${totalInserted.toLocaleString()}/1,000,000 | Rate: ${rate}/sec | Time: ${elapsed}s`);

                            transactions = [];
                        } catch (error) {
                            console.error(`❌ Error inserting batch:`, error);
                        }

                        stream.resume();
                    }
                } catch (error) {
                    console.error(`❌ Error parsing row ${totalParsed}:`, error);
                }
            })
            .on('end', async () => {
                console.log(`📊 Finished parsing ${totalParsed.toLocaleString()} rows`);


                if (transactions.length > 0) {
                    try {
                        await prisma.sales.createMany({
                            data: transactions,
                        });
                        totalInserted += transactions.length;
                        console.log(`✅ Inserted final batch: ${transactions.length} records`);
                    } catch (error) {
                        console.error(`❌ Error inserting final batch:`, error);
                    }
                }

                const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
                const avgRate = Math.round(totalInserted / (Date.now() - startTime) * 1000);

                console.log(`\n🎉 Database seeded successfully!`);
                console.log(`📊 Total records inserted: ${totalInserted.toLocaleString()}`);
                console.log(`⏱️  Total time: ${totalTime} minutes`);
                console.log(`⚡ Average rate: ${avgRate} records/second`);

                await prisma.$disconnect();
                process.exit(0);
            })
            .on('error', (error) => {
                console.error('❌ Error reading CSV:', error);
                process.exit(1);
            });

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

seedDatabase();