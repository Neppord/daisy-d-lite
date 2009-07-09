import sys
import mimetypes
import base64
import StringIO
import re
def Assembel(input,outfile):
	infile=file(input,"rb")
	mime=mimetypes.guess_type(input[:-5])[0]
	outfile.write("data:"+mime+";base64,")
	s=infile.read()
	stringIO=StringIO.StringIO(s)
	base64.encode(stringIO,outfile)

if __name__=="__main__":
	if len(sys.argv)<=2:
		Assembel(sys.argv[1],file(sys.argv[1]+".url","w"))
	else:
		Assembel(sys.argv[1],file(sys.argv[2],"w"))
