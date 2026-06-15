import glob, re

for f in glob.glob('src/routes/*.tsx'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove all the broken lines
    content = re.sub(r'import\s+\{\s*createFileRoute.*?\} from ["\']@tanstack/react-router["\'];?`nimport\s+\{.*\} from [\'"]@tanstack/react-router["\'];?\n?', '', content)
    content = re.sub(r'import\s+\{\s*createFileRoute.*?\} from ["\']@tanstack/react-router["\'];?`nimport\s+\{.*?,\s*Link\s*\} from ["\']@tanstack/react-router["\'];?\n?', '', content)
    
    # Also just manually clean up any `n literal
    content = content.replace("`n", "\n")
    
    # Let's just do a clean sweep. Remove all lines matching import { ... createFileRoute ... } and Link from @tanstack/react-router or react-start
    # We will reconstruct them.
    lines = content.split('\n')
    new_lines = []
    needs_router = False
    needs_link = False
    needs_navigate = False
    
    for line in lines:
        if 'createFileRoute' in line and '@tanstack' in line:
            needs_router = True
            if 'Link' in line: needs_link = True
            if 'useNavigate' in line: needs_navigate = True
            continue
        if 'Link' in line and '@tanstack/react-router' in line:
            needs_link = True
            continue
        if 'useNavigate' in line and '@tanstack/react-router' in line:
            needs_navigate = True
            continue
        if 'Link' in line and '@tanstack/react-start' in line:
            needs_link = True
            continue
        if 'useNavigate' in line and '@tanstack/react-start' in line:
            needs_navigate = True
            continue
            
        new_lines.append(line)
        
    imports = ["createFileRoute"]
    if needs_link: imports.append("Link")
    if needs_navigate: imports.append("useNavigate")
    
    final_content = f'import {{ {", ".join(imports)} }} from "@tanstack/react-router";\n' + '\n'.join(new_lines)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(final_content)
