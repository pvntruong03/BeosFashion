from zipfile import ZipFile
from lxml import etree
import re
p=r'C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-001584160.docx'
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
with ZipFile(p) as z:
 root=etree.fromstring(z.read('word/document.xml'))
 for tag in ['ins','del','moveFrom','moveTo']:
  nodes=root.xpath(f'.//w:{tag}',namespaces=ns)
  print(tag,len(nodes))
  for n in nodes:
   tx=''.join(n.xpath('.//w:t/text() | .//w:delText/text()',namespaces=ns))
   if tx.strip(): print(' ',repr(re.sub(r'\s+',' ',tx)[:260]))
