const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, 'src', 'components', 'layout', 'Sidebar.jsx');
let content = fs.readFileSync(sidebarPath, 'utf8');

// Replace background color
content = content.replace(/bg-gray-900/g, 'bg-brand-brown');

// Replace dark green with brand-gold
content = content.replace(/text-\[#1E5E45\]/g, 'text-brand-gold');
content = content.replace(/bg-\[#1E5E45\]\/10/g, 'bg-brand-gold/10');
content = content.replace(/bg-\[#1E5E45\]/g, 'bg-brand-gold');

// Replace gray-500 with brand-text-muted
content = content.replace(/text-gray-500/g, 'text-brand-text-muted');

// Replace text-gray-900 in modal with brand-brown
content = content.replace(/text-gray-900/g, 'text-brand-brown');

fs.writeFileSync(sidebarPath, content, 'utf8');

console.log('Restored Sidebar colors.');
