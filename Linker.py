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
		f=open("/".join([os.path.dirname(outfile.name).lstrip("./"),name.lstrip("./")+".url"]));
		fs=f.read()
		s=s.replace(name,fs.replace("\n",""))
	outfile.write(s)

def findURLs(string,mime):
	ret=[]
	ret+=map(lambda x:x[7:-1],re.findall(r'\shref=".*?"',string));
	ret+=map(lambda x:x[7:-1],re.findall(r"\sref='.*?'",string));
	ret+=map(lambda x:x[6:-1],re.findall(r'\ssrc=".*?"',string));
	ret+=map(lambda x:x[6:-1],re.findall(r"\ssrc='.*?'",string));
	ret+=map(lambda x:x[6:-2],re.findall(r"\surl\('.*?'\)",string));
	ret+=map(lambda x:x[6:-2],re.findall(r'\surl\(".*?"\)',string));
	return ret;

if __name__=="__main__":
	if len(sys.argv)<=2:
		Link(file(sys.argv[1],"rb"),file(sys.argv[1]+".link","w"))
	else:
		Link(file(sys.argv[1],"rb"),file(sys.argv[2],"w"))
