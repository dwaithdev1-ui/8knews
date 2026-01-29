const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:3000/api';
const SECRET = 'secret8knews'; // From index.js default

async function createTestPDF() {
    const pdfDoc = await PDFDocument.create();
    const page1 = pdfDoc.addPage([600, 400]);
    page1.drawText('This is the first page of the Digital Magazine!', {
        x: 50,
        y: 350,
        size: 30,
        color: rgb(0, 0.53, 0.71),
    });
    const page2 = pdfDoc.addPage([600, 400]);
    page2.drawText('Page 2: More content here.', {
        x: 50,
        y: 350,
        size: 20,
        color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test_magazine.pdf', pdfBytes);
    return 'test_magazine.pdf';
}

async function runTest() {
    try {
        console.log("1. Creating Test PDF...");
        const pdfPath = await createTestPDF();
        console.log("PDF Created:", pdfPath);

        // Create a fake admin token
        const token = jwt.sign(
            { _id: 'dummy_admin_id', email: 'admin@8knews.com', role: 'admin' },
            SECRET,
            { expiresIn: '1h' }
        );

        console.log("2. Uploading Digital Magazine...");
        const form = new FormData();
        form.append('title', 'Test Digital Magazine');
        form.append('description', 'Automated test upload of a PDF magazine.');
        form.append('category_ids', JSON.stringify(['697766a2bc54a3e8c5e01514'])); // Digital Magazines ID
        form.append('sub_category', 'lifestyle');
        form.append('is_full_card', 'false');
        form.append('is_video', 'false');
        form.append('type', 'news');
        form.append('status', 'published'); // Publish immediately to test
        form.append('image', fs.createReadStream(pdfPath));

        const response = await axios.post(`${API_URL}/news`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("Upload Response:", response.data);

        if (response.data.success) {
            console.log("3. Verifying Uploads...");
            // Check if images exist in the expected directory
            const newsId = response.data.id;
            const magazineDir = path.join(__dirname, '../server/uploads/magazines', newsId);

            console.log("Checking dir:", magazineDir);

            if (fs.existsSync(magazineDir)) {
                const files = fs.readdirSync(magazineDir);
                console.log("Files generated in magazine dir:", files);
                if (files.length >= 2 && files.includes('page_1.jpg')) {
                    console.log("SUCCESS: Magazine pages generated successfully!");
                } else {
                    console.error("FAILURE: Expected pages not found.");
                }
            } else {
                console.error("FAILURE: Magazine directory not created.");
            }
        }

    } catch (error) {
        console.error("Test Failed:", error.response ? error.response.data : error.message);
    }
}

runTest();
