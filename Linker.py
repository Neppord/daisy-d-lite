import sys
import os
import mimetypes
import base64
import StringIO
import re
def Link(infile,outfile):
	mime=mimetypes.guess_type(infile.name)[0]
	s=infile.read()
	lis=findURLs(s,mime)
	for name in lis: 
		f=open(os.path.join(os.path.dirname(infile.name),name+".url"));
		fs=f.read()
		s=s.replace(name,fs.replace("\n",""))
	outfile.write(s)

def findURLs(string,mime):
	ret=[]
	ret+=map(lambda x:x[6:-1],re.findall(r'href=".*?"',string));
	ret+=map(lambda x:x[6:-1],re.findall(r"href='.*?'",string));
	ret+=map(lambda x:x[5:-1],re.findall(r'src=".*?"',string));
	ret+=map(lambda x:x[5:-1],re.findall(r"src='.*?'",string));
	ret+=map(lambda x:x[5:-2],re.findall(r"url\('.*?'\)",string));
	ret+=map(lambda x:x[5:-2],re.findall(r'url\(".*?"\)',string));
	return ret;

if __name__=="__main__":
	Link(file(sys.argv[1],"rb"),file(sys.argv[1]+".link","w"))
