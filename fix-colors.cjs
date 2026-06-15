const fs = require('fs');
const files = [
  'src/components/member-talpat.css',
  'src/components/shg-dashboard.css'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace white-based semi-transparent backgrounds with black-based
  content = content.replace(/rgba\(255, 255, 255, (0\.\d+)\)/g, 'rgba(0, 0, 0, $1)');
  
  // Tabs and general text
  content = content.replace(/color: #718096/g, 'color: #64748b'); // unselected tab
  content = content.replace(/color: #e2e8f0/g, 'color: #0f172a'); // active/strong text
  content = content.replace(/color: #a0aec0/g, 'color: #475569'); // lighter text
  content = content.replace(/color: #cbd5e0/g, 'color: #334155'); // medium text
  content = content.replace(/color: #4a5568/g, 'color: #94a3b8'); // borders/lines
  
  // profile header
  content = content.replace(/linear-gradient\(135deg, #1a1f35 0%, #0d1117 100%\)/g, 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)');
  
  fs.writeFileSync(f, content);
});
console.log('Fixed colors!');
