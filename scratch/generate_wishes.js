const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'netlify', 'functions', 'wishes-data.json');

const names = [
  'Aravind', 'Bhuvanesh', 'Chitra', 'Divya', 'Elango', 'Fathima', 'Ganesh', 'Hari', 'Indhu', 'Jaya',
  'Karthik', 'Lakshmi', 'Mani', 'Nandhini', 'Oviya', 'Prabhu', 'Ramya', 'Suresh', 'Tamil', 'Uma',
  'Vignesh', 'Yamini', 'Zahir', 'Anand', 'Deepa', 'Gokul', 'Ishwarya', 'Janani', 'Kavin', 'Meena',
  'Naveen', 'Pavithra', 'Rajesh', 'Sangeetha', 'Tharun', 'Vidya', 'Arun', 'Devi', 'Hariharan', 'Kokila'
];

const greetings = [
  'Wishing you both a lifetime of love and happiness!',
  'Happy married life, Aiswarya and Dineshkanna!',
  'May your love grow stronger with each passing day. Congratulations!',
  'Wishing you a wonderful journey as you build your new life together.',
  'May your joined hands always be held in love. Happy wedding!',
  'Congratulations on this beautiful milestone in your lives!',
  'May God bless your marriage with endless joy and peace.',
  'So happy to celebrate your special day with you. Best wishes!',
  'Congratulations to the lovely couple! Have a beautiful life ahead.',
  'Wishing you both the absolute best today and always.'
];

const wishes = [];
const baseTime = new Date('2026-07-20T18:00:00Z');

for (let i = 1; i <= 100; i++) {
  const name = names[Math.floor(Math.random() * names.length)] + ' ' + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const message = greetings[Math.floor(Math.random() * greetings.length)] + ` (Wish #${101 - i})`;
  const timestamp = new Date(baseTime.getTime() - i * 3600000).toISOString(); // 1 hour intervals back in time
  const id = Math.random().toString(36).substring(2, 15);

  wishes.push({
    id,
    name,
    message,
    timestamp
  });
}

fs.writeFileSync(targetPath, JSON.stringify(wishes, null, 2), 'utf8');
console.log('Successfully generated 100 wishes in wishes-data.json!');
