import os
import json
import glob
from datetime import datetime

history_dir = r"C:\Users\HP\AppData\Roaming\Code\User\History"
target_dir = r"C:\Users\HP\Downloads\digital-register-shg-main\digital-register-shg-main"
output_dir = r"C:\Users\HP\Downloads\digital-register-shg-main\digital-register-shg-main-recovered"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

found_files = 0
for folder in os.listdir(history_dir):
    folder_path = os.path.join(history_dir, folder)
    if not os.path.isdir(folder_path): continue
    
    entries_file = os.path.join(folder_path, 'entries.json')
    if not os.path.exists(entries_file): continue
    
    try:
        with open(entries_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        resource = data.get('resource', '')
        if resource.startswith('file:///'):
            # Convert file:///c%3A/Users/... to c:\Users\...
            path = resource[8:].replace('%3A', ':').replace('/', '\\')
            
            if path.lower().startswith(target_dir.lower()):
                # This file belongs to our target directory
                entries = data.get('entries', [])
                if not entries: continue
                
                # Get the latest entry
                latest_entry = entries[-1]
                file_id = latest_entry.get('id')
                
                if file_id:
                    source_file = os.path.join(folder_path, file_id)
                    if os.path.exists(source_file):
                        # Calculate relative path
                        rel_path = path[len(target_dir):].lstrip('\\')
                        dest_path = os.path.join(output_dir, rel_path)
                        
                        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                        
                        with open(source_file, 'rb') as sf:
                            content = sf.read()
                        with open(dest_path, 'wb') as df:
                            df.write(content)
                        print(f"Recovered: {rel_path}")
                        found_files += 1
    except Exception as e:
        print(f"Error reading {entries_file}: {e}")

print(f"Total files recovered: {found_files}")
