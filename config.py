import sys
import getopt
import os
import mimetypes
from Linker import findURLs

def makeMakefile(f,url):
	f.write("#dependecis for file "+url+"\n")
	thisf=open(url,"rb")
	mime=mimetypes.guess_type(url)[0]
	base=os.path.dirname(url)
	deps=findURLs(thisf.read(),mime)
	url=url[4:]# removes the src/
	f.write(url+".link: "+url+" "+" ".join(map(lambda a:os.path.join(base[4:],a)+".url",deps))+"\n")
	f.write("	python Linker.py $< $@\n\n")
	for d in deps:
		makeMakefile(f,os.path.join(base,d))


if __name__=="__main__":
	try:
		opts,args=getopt.getopt(sys.argv[1:],"n",["dry-run"])
	except getopt.GetoptError, err:
		print str(err)
		sys.exit(2)
	if ("-n","") in opts:
		f=sys.stdout
	else:
		f=file("makefile","w")
	f.write("""
#this file was generated by the config script

#vpath rules for sorce files
vpath %.html	src
vpath %.js	src
vpath %.css	src
vpath %.png	src

#vpath rules for build files
vpath %.link	build
vpath %.url	build

all: dist
dist: build
	cp build/index.html.link dist/index.html
build: index.html.link
.PHONY:clean
clean:
	-rm -r build/* dist/*
%.link:%
	python Linker.py $< $@
%.url:%.link
	python Assambler.py $< $@
""")
	makeMakefile(f,"src/index.html")
