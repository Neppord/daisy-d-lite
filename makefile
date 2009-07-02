all:index.html.link
	cp index.html.link compact.html
index.html.link: index.html src/script.js.url src/Daisypict.jpg.url src/basic_color.css.url src/basic_dimentions.css.url
	python Linker.py index.html

src/script.js.link: src/script.js
	python Linker.py src/script.js
src/Daisypict.jpg.link: src/Daisypict.jpg
	python Linker.py src/Daisypict.jpg
src/basic_color.css.link: src/basic_color.css src/progress_gray.gif.url src/progress.gif.url src/progress_anm.gif.url
	python Linker.py src/basic_color.css
src/basic_dimentions.css.link: src/basic_dimentions.css
	python Linker.py src/basic_dimentions.css
src/progress_gray.gif.link: src/progress_gray.gif
	python Linker.py src/progress_gray.gif
src/progress.gif.link: src/progress.gif
	python Linker.py src/progress.gif
src/progress_anm.gif.link: src/progress_anm.gif
	python Linker.py src/progress_anm.gif

src/progress_anm.gif.url: src/progress_anm.gif.link
	python Assambler.py src/progress_anm.gif
src/progress.gif.url: src/progress.gif.link
	python Assambler.py src/progress.gif
src/progress_gray.gif.url: src/progress_gray.gif.link
	python Assambler.py src/progress_gray.gif
src/script.js.url: src/script.js.link
	python Assambler.py src/script.js
src/Daisypict.jpg.url: src/Daisypict.jpg.link
	python Assambler.py src/Daisypict.jpg
src/basic_color.css.url: src/basic_color.css.link
	python Assambler.py src/basic_color.css
src/basic_dimentions.css.url: src/basic_dimentions.css.link
	python Assambler.py src/basic_dimentions.css
clean:
	rm compact.html *.link src/*.link src/*.url

