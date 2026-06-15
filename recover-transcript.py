import os
import json
import re

transcript_path = r"C:\Users\HP\.gemini\antigravity-ide\brain\69e9ebdf-9c01-4c47-84db-2fc1ef02cea1\.system_generated\logs\transcript.jsonl"
target_dir = r"C:\Users\HP\Downloads\digital-register-shg-main\digital-register-shg-main"

recovered_files = {}

try:
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                entry = json.loads(line)
            except:
                continue
            
            # Check for view_file tool output
            if entry.get("type") == "TOOL_OUTPUT":
                content = entry.get("content", "")
                if "File Path: `file:///" in content:
                    # Extract the file path
                    match = re.search(r"File Path: `file:///(.*?)`", content)
                    if match:
                        file_path = match.group(1).replace('%3A', ':').replace('/', '\\')
                        
                        if file_path.lower().startswith(target_dir.lower()) and file_path not in recovered_files:
                            # Parse the file content from the view_file output
                            # It is usually after "The following code has been modified to include a line number before every line... \n"
                            # We can just extract all lines matching `\d+: (.*)`
                            lines = []
                            for c_line in content.split('\n'):
                                m = re.match(r'^\d+: (.*)', c_line)
                                if m:
                                    lines.append(m.group(1))
                            
                            if lines:
                                recovered_files[file_path] = '\n'.join(lines)
except Exception as e:
    print(f"Error reading transcript: {e}")

# Now restore these files to the target directory
for file_path, content in recovered_files.items():
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Recovered: {file_path}")
    except Exception as e:
        print(f"Error writing {file_path}: {e}")

print(f"Total files recovered from transcript: {len(recovered_files)}")
