import glob, os, re

for f in glob.glob('src/routes/*.tsx'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace broken powershell replace artifact
    content = content.replace("import { createFileRoute } from \"@tanstack/react-router\";\nimport {", "")
    
    # Replace `@tanstack/react-start` to `@tanstack/react-router` if it contains createFileRoute
    content = re.sub(r'import\s+\{\s*createFileRoute(.*?)\}\s+from\s+[\'\"]@tanstack/react-start[\'\"]', r'import { createFileRoute\1} from "@tanstack/react-router"', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
