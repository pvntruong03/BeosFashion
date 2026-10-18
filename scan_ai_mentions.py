from pathlib import Path
from zipfile import ZipFile
from lxml import etree
import re

path=Path(r'C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-001584160.docx')
patterns=[
 r'\bAI\b', r'\bGPT(?:-?\d+(?:\.\d+)?)?\b', r'ChatGPT', r'OpenAI', r'Gemini', r'Claude',
 r'Copilot', r'\bLLM\b', r'large language model', r'artificial intelligence', r'generative AI',
 r'language model', r'prompt(?:ing)?', r'AI[- ]generated'
]
rx=re.compile('|'.join('(?:'+p+')' for p in patterns),re.I)
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
with ZipFile(path) as z:
    names=z.namelist()
    candidates=[n for n in names if n.endswith(('.xml','.rels'))]
    found=[]
    for name in candidates:
        data=z.read(name)
        try:
            root=etree.fromstring(data)
            text=' '.join(root.xpath('.//w:t/text()',namespaces=ns))
            # non-Word XML metadata values
            if not text:
                text=' '.join(root.xpath('.//text()'))
        except Exception:
            text=data.decode('utf-8','ignore')
        for m in rx.finditer(text):
            a=max(0,m.start()-100); b=min(len(text),m.end()+160)
            found.append((name,m.group(),re.sub(r'\s+',' ',text[a:b])))
    print('MATCHES',len(found))
    for name,term,ctx in found:
        print('PART',name)
        print('TERM',repr(term))
        print('CONTEXT',ctx)
    print('HAS_COMMENT_PARTS', [n for n in names if 'comment' in n.lower()])
    print('HAS_TRACKED_CHANGES', any(tag in z.read('word/document.xml').decode('utf-8','ignore') for tag in ('<w:ins','<w:del','<w:moveFrom','<w:moveTo')))
