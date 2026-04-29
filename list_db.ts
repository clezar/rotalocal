
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function list() {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
        console.log("Config not found");
        return;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const app = initializeApp(config);
    const db = getFirestore(app);

    const snapshot = await getDocs(collection(db, 'businesses'));
    console.log(`Total businesses: ${snapshot.size}`);
    snapshot.forEach(doc => {
        console.log(`ID: ${doc.id} | Name: ${doc.data().name}`);
    });
}

list().catch(console.error);
