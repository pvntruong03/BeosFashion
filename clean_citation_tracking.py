from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import os, re, tempfile
from docx import Document

path=Path(r'C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-001584160.docx')
patterns=[
    (re.compile(r'\?utm_source=chatgpt\.com(?=(&|\"|<|$))', re.I), ''),
    (re.compile(r'&amp;utm_source=chatgpt\.com(?=(&amp;|\"|<|$))', re.I), ''),
    (re.compile(r'&utm_source=chatgpt\.com(?=(&|\"|<|$))', re.I), ''),
]
changed=[]
tmp=path.with_suffix('.cleaning.tmp')
with ZipFile(path,'r') as zin, ZipFile(tmp,'w',ZIP_DEFLATED) as zout:
    for info in zin.infolist():
        data=zin.read(info.filename)
        if info.filename.endswith(('.xml','.rels')):
            text=data.decode('utf-8')
            original=text
            for pattern,repl in patterns:
                text=pattern.sub(repl,text)
            if text != original:
                changed.append((info.filename, original.count('utm_source=chatgpt.com') - text.count('utm_source=chatgpt.com')))
                data=text.encode('utf-8')
        zout.writestr(info, data)
os.replace(tmp,path)
# Validate the repaired document package and remaining references.
doc=Document(path)
with ZipFile(path) as z:
    remaining=sum(z.read(n).lower().count(b'utm_source=chatgpt.com') for n in z.namelist() if n.endswith(('.xml','.rels')))
    valid=z.testzip() is None
print('CHANGED',changed)
print('REMAINING',remaining,'PACKAGE_VALID',valid,'PARAGRAPHS',len(doc.paragraphs))
