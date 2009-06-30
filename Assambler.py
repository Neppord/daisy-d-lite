import sys
import mimetypes
import base64
import StringIO
import re
def Assembel(input,outfile):
	infile=file(input+".link","rb")
	mime=mimetypes.guess_type(input)[0]
	outfile.write("data:"+mime+";base64,")
	s=infile.read()
	stringIO=StringIO.StringIO(s)
	base64.encode(stringIO,outfile)

if __name__=="__main__":
	Assembel(sys.argv[1],file(sys.argv[1]+".url","w"))
