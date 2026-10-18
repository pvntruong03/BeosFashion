from docx import Document
p=r'C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-001584160.docx'
d=Document(p)
for i,x in enumerate(d.paragraphs):
 if '\ufffd' in x.text:
  print(i,repr(x.text))
